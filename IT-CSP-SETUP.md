# IPGS Website — Security Header Configuration
## Instructions for the HZAU Server Administration Team

**Website:** International Plant Grafting Society (IPGS)  
**URL:** `https://chfs-en.hzau.edu.cn/ipgs/`  
**Prepared by:** IPGS Secretariat, HZAU-CHFS  
**Date:** April 2026

---

## What This Is and Why It Matters

This document asks you to add three HTTP security response headers to the web server for the IPGS subdirectory. These headers are invisible to visitors but tell the browser how to behave securely. They are a standard requirement for institutional and academic websites.

No changes to any files are needed — only to the server configuration.

---

## Headers to Add

### 1. Content-Security-Policy (CSP)
Tells the browser which external sources are allowed to load scripts, fonts, and styles. Blocks any unauthorized injected code.

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://3c2f556e.sibforms.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://3c2f556e.sibforms.com https://formspree.io;
```

**Why `'unsafe-inline'` for styles?** The site uses inline `style=""` attributes on HTML elements throughout. Removing them would require a full CSS refactor. This is acceptable for a low-risk academic content site.

---

### 2. X-Frame-Options
Prevents the site from being embedded inside an iframe on another domain (clickjacking protection).

```
X-Frame-Options: SAMEORIGIN
```

---

### 3. X-Content-Type-Options
Prevents browsers from guessing ("sniffing") the file type, which can be exploited.

```
X-Content-Type-Options: nosniff
```

---

## How to Apply — Choose Your Server

### Option A: Apache (most common at HZAU)

Add the following to your Apache virtual host config or to a `.htaccess` file in the `/ipgs/` directory:

```apache
<Directory "/path/to/ipgs/">
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://3c2f556e.sibforms.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://3c2f556e.sibforms.com https://formspree.io;"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
</Directory>
```

Make sure `mod_headers` is enabled:
```bash
sudo a2enmod headers
sudo systemctl reload apache2
```

Or using `.htaccess` (if `AllowOverride All` is set):

```apache
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://3c2f556e.sibforms.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://3c2f556e.sibforms.com https://formspree.io;"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
</IfModule>
```

---

### Option B: Nginx

Add inside the `location /ipgs/` block in your Nginx config:

```nginx
location /ipgs/ {
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://3c2f556e.sibforms.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://3c2f556e.sibforms.com https://formspree.io;" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Then reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option C: IIS (Windows Server)

In IIS Manager → select the `/ipgs` application → HTTP Response Headers → Add:

| Name | Value |
|------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://3c2f556e.sibforms.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://3c2f556e.sibforms.com https://formspree.io;` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |

Or via `web.config`:

```xml
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Content-Security-Policy" value="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://3c2f556e.sibforms.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://3c2f556e.sibforms.com https://formspree.io;" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-Content-Type-Options" value="nosniff" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

---

## How to Verify It Worked

After applying, run the following from any terminal:

```bash
curl -I https://chfs-en.hzau.edu.cn/ipgs/index.html
```

You should see the three headers in the response. Example expected output:

```
HTTP/2 200
content-security-policy: default-src 'self'; ...
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
```

Or use the free online tool: **https://securityheaders.com** — enter `https://chfs-en.hzau.edu.cn/ipgs/` and it will grade the headers.

---

## External Sources Used by This Website

For reference, here are all the third-party services the IPGS site loads from:

| Service | Domain | Purpose |
|---------|---------|---------|
| Google Fonts | `fonts.googleapis.com`, `fonts.gstatic.com` | Typography (Inter font) |
| jsDelivr CDN | `cdn.jsdelivr.net` | Interactive world map (jsvectormap) |
| Brevo (Sendinblue) | `3c2f556e.sibforms.com` | Newsletter subscription form |
| Formspree | `formspree.io` | Membership application form |

If any of these change in future (e.g., a new analytics tool is added), the CSP header will need to be updated accordingly. Please notify the IPGS web maintainer before making changes.

---

## Contact

For questions about this configuration, contact the IPGS web team:  
**Email:** chfsfao@mail.hzau.edu.cn  
**College of Horticulture & Forestry Sciences, HZAU**
