# NetworkBuster - Data Storage & Visitor IP Tracking

## 📊 Current Data Storage Architecture

### 1. **Vercel Edge Network (Primary - Production)**
**Location:** Global CDN + Edge Functions
- **Data Stored:** 
  - Static assets (HTML, CSS, JS, images)
  - Compiled React builds
  - Blog content
  - Dashboard metrics
  
- **Region:** Distributed globally via Vercel's edge network
- **Retention:** Permanent (cached)
- **Cost:** Included in Vercel deployment

**Vercel Analytics Data:**
- Request logs available in Vercel dashboard
- Performance metrics: Page load times, Core Web Vitals
- Deployment history and build logs
- **IP Data:** Vercel captures request IPs but anonymizes by default

---

### 2. **Azure Cloud Storage (Secondary - Infrastructure)**

#### **Azure Log Analytics Workspace**
```
Service: Log Analytics Workspace
Name: networkbuster-logs
Region: eastus
Retention: 30 days (configurable)
Subscription: cdb580bc-e2e9-4866-aac2-aa86f0a25cb3
```

**What's Logged:**
- Container App request logs
- CPU/Memory metrics
- Error traces
- HTTP request details (including user agent, response codes)
- Network activity

**IP Tracking Capability:**
- Source IP addresses captured in request logs
- Available via KQL (Kusto Query Language) queries
- Example query to extract visitor IPs:
```kusto
ContainerAppConsoleLogs
| where LogLevel == "RequestReceived"
| project TimeGenerated, ClientIP=extract(@'(\d+\.\d+\.\d+\.\d+)', 1, SourceIP), RequestPath, ResponseStatus
| summarize Count=count() by ClientIP
| order by Count desc
```

#### **Azure Container Registry**
```
Service: Container Registry
Name: networkbusterlo25gft5nqwzg
Type: Basic tier
Region: eastus
```

**Data Stored:**
- Docker image layers (compressed)
- Image metadata
- Build history
- No visitor/IP data (infrastructure only)

#### **Azure Storage Blob** (Configured but Optional)
**Location:** Azure Storage Account (if enabled)
- Suitable for: File uploads, attachments, user-generated content
- IP data: Request metadata available in storage analytics
- Retention: Configurable lifecycle policies

---

## 🕵️ Visitor IP Extraction & Analytics

### **Method 1: Vercel Analytics (Recommended)**

**Access Point:** https://vercel.com → Dashboard → Analytics

**Available Data:**
- Visitor country/region (GeoIP)
- Page views by path
- Referrer information
- Device type (mobile/desktop)
- Browser type
- **IP Address:** Not directly exposed in UI, but available via:

```bash
# Via Vercel CLI
vercel env ls analytics
vercel inspect <deployment-id>
```

**Limitation:** Vercel anonymizes IP by default (e.g., 192.168.1.xxx)

---

### **Method 2: Azure Log Analytics (Full IP Capture)**

**Access Point:** Azure Portal → Log Analytics Workspaces → networkbuster-logs

**Query to Extract All Visitor IPs:**
```kusto
// Get all unique visitor IPs with timestamps
union 
  ContainerAppConsoleLogs,
  AzureActivity
| where isnotnull(ClientIpAddress)
| project 
  TimeGenerated,
  ClientIP=ClientIpAddress,
  HttpStatus=httpStatus_d,
  RequestPath=url_s,
  UserAgent=useragent_s,
  ReferrerIP=CallerIpAddress,
  ResourceGroup=ResourceGroup,
  OperationName
| summarize 
  RequestCount=count(), 
  FirstSeen=min(TimeGenerated),
  LastSeen=max(TimeGenerated),
  UniqueStatuses=dcount(HttpStatus)
  by ClientIP
| order by RequestCount desc
```

**Advanced IP Tracking Query:**
```kusto
// Detailed visitor behavior by IP
ContainerAppConsoleLogs
| extend ClientIP = extract(@'(\d+\.\d+\.\d+\.\d+)', 1, SourceIP)
| where isnotnull(ClientIP)
| project 
  Timestamp=TimeGenerated,
  IPAddress=ClientIP,
  Path=tolower(RequestPath_s),
  Method=HttpMethod_s,
  StatusCode=HttpStatusCode_d,
  ResponseTimeMs=Duration_ms,
  UserAgent=useragent_s,
  Referer=Referer_s,
  SessionId=ClientSessionId_g
| where Path contains "overlay" or Path contains "dashboard" or Path contains "blog"
| order by Timestamp desc
```

**Export IP List (CSV):**
```kusto
ContainerAppConsoleLogs
| extend ClientIP = tostring(ClientIpAddress)
| where isnotnull(ClientIP)
| distinct ClientIP, SourceRegion, SourceCity
| order by ClientIP asc
```

---

## 💾 Where Data Is Currently Being Saved

| **Storage Location** | **Type** | **Data** | **Retention** | **Access** |
|---|---|---|---|---|
| **Vercel CDN** | Static | HTML, CSS, JS, images | Permanent | Vercel Dashboard |
| **Azure Container Apps** | Runtime Logs | Request logs, metrics | 30 days | Azure Portal |
| **Azure Log Analytics** | Analytics | Visitor IPs, events, traces | 30 days | KQL Queries |
| **Azure Container Registry** | Images | Docker images, layers | Permanent | ACR Dashboard |
| **GitHub Actions** | Build Logs | CI/CD execution logs | 90 days | GitHub Actions tab |
| **Git Repository** | Source Code | All code, configs, docs | Permanent | GitHub repo |

---

## 🔓 Raw Visitor IP Extraction Commands

### **Direct Azure Query (PowerShell)**
```powershell
# Connect to Azure
Connect-AzAccount
Set-AzContext -Subscription "cdb580bc-e2e9-4866-aac2-aa86f0a25cb3"

# Query Log Analytics for visitor IPs
$Query = @"
ContainerAppConsoleLogs
| where TimeGenerated > ago(7d)
| extend ClientIP = extract('(\d+\.\d+\.\d+\.\d+)', 1, SourceIP)
| where isnotnull(ClientIP)
| summarize Count=count() by ClientIP
| order by Count desc
"@

Invoke-AzOperationalInsightsQuery -WorkspaceName "networkbuster-logs" -ResourceGroupName "networkbuster-rg" -Query $Query
```

### **Azure CLI Method**
```bash
# Query last 24 hours of IP traffic
az monitor log-analytics query \
  --workspace "networkbuster-logs" \
  --analytics-query "
    ContainerAppConsoleLogs 
    | where TimeGenerated > ago(24h)
    | extend IP = extract('(\d+\.\d+\.\d+\.\d+)', 1, SourceIP)
    | summarize Requests=count() by IP
  " \
  --out table
```

### **Export All Visitor IPs (Last 30 Days)**
```kusto
ContainerAppConsoleLogs
| where TimeGenerated > ago(30d)
| extend ClientIP = tostring(ClientIpAddress)
| where isnotnull(ClientIP) and ClientIP != "" and ClientIP != "127.0.0.1"
| distinct ClientIP
| sort by ClientIP asc
```

---

## 🛡️ Privacy & Compliance Notes

### **IP Data Classification**
- **Personal Data:** Yes (under GDPR/CCPA)
- **Retention Requirement:** Document purpose for tracking
- **User Consent:** Should be disclosed in privacy policy
- **Anonymization:** Consider using IP ranges instead of full IPs

### **Current Status:**
⚠️ **Full IPs are being captured** in Azure Log Analytics
- Retention: 30 days
- Accessible to: Anyone with Azure subscription access
- **Recommendation:** Implement consent management & privacy policy

---

## 📍 Visitor Geographic Analysis (Derived from IPs)

**Azure Log Analytics can geo-locate IPs:**
```kusto
ContainerAppConsoleLogs
| extend ClientIP = tostring(ClientIpAddress)
| where isnotnull(ClientIP)
| extend 
  Country = geoip_country_code(ClientIP),
  Region = geoip_region(ClientIP),
  City = geoip_city(ClientIP),
  Latitude = toreal(geoip_latitude(ClientIP)),
  Longitude = toreal(geoip_longitude(ClientIP))
| project ClientIP, Country, Region, City, Latitude, Longitude, TimeGenerated
| where Country != "127"
| summarize Visitors=dcount(ClientIP) by Country, Region, City
```

---

## ⚙️ Configuration Summary

**Current Setup:**
- ✅ Vercel: Anonymized IP tracking (default)
- ✅ Azure: Full IP logging (30-day retention)
- ❌ Database: No persistent database configured
- ❌ Analytics Tool: No third-party analytics (Segment, Mixpanel, etc.)
- ❌ Cookies: No tracking cookies configured

**Recommendations:**
1. Add privacy policy disclosure
2. Document consent mechanism
3. Configure Log Analytics retention policy
4. Consider IP anonymization for GDPR compliance
5. Implement opt-in analytics

---

**Last Updated:** December 14, 2025
**Status:** Ready for data analysis via Azure Log Analytics
