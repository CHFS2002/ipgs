# IPGS Website — Deployment Guide

A static, build-free website for the International Plant Grafting Society. Deployable as-is to any web server.

Target URL: `https://chfs-en.hzau.edu.cn/IPGS`

---

## 1. What's in this folder

```
ipgs-website/
├── index.html               Home
├── about.html               About IPGS
├── about/
│   ├── governance.html      Governance architecture
│   └── roadmap.html         Five-phase roadmap 2026–2030+
├── membership.html          Tiers, founding members, application form
├── research.html            3-tier research model + 7 Working Groups
├── knowledge.html           Knowledge Commons (MIGE, FAIR policy)
├── events.html              Events programmes and calls
├── founding-meeting.html    Wuhan, 7–10 May 2026 landing page
├── news.html                Announcements and newsletter
├── contact.html             Secretariat, regional desks, contact form
├── privacy.html             Privacy policy (draft)
├── code-of-conduct.html     Code of Conduct (draft)
├── accessibility.html       WCAG 2.1 AA statement
├── 404.html                 Friendly "not found" page
├── robots.txt               Search-engine directives
├── sitemap.xml              XML sitemap
├── .htaccess                Apache config (safe on Nginx; ignored there)
├── css/style.css            Single stylesheet, no preprocessor
├── js/main.js               Minimal vanilla JS (mobile nav, form demo)
└── assets/
    ├── logo.svg             IPGS wordmark
    └── favicon.svg          Browser favicon
```

**Total page count:** 14 public HTML pages + 4 support files.
**No build step required.** No Node, no Python, no bundler — just static files.

---

## 2. Deployment — three options

### Option A: Apache (most common — what `chfs-en.hzau.edu.cn` likely runs)

1. Create the directory `/IPGS` inside the web root (e.g. `/var/www/html/IPGS` or the equivalent on your server).
2. Upload the **entire contents** of `ipgs-website/` into that directory.
3. Ensure `index.html` is in the list of directory-index filenames (it is by default on Apache).
4. Verify by opening `https://chfs-en.hzau.edu.cn/IPGS/` in a browser.

Apache will pick up the bundled `.htaccess` for compression, cache headers, security headers, and the custom 404. No action needed.

### Option B: Nginx

Add to your server block (or an `include` file) — adjust `root` to your layout:

```nginx
location /IPGS/ {
    alias /var/www/ipgs-website/;
    index index.html;
    try_files $uri $uri/ /IPGS/404.html;

    # Cache headers for static assets
    location ~* \.(css|js|svg|png|jpg|jpeg|webp|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

Reload Nginx: `sudo nginx -s reload`.

### Option C: Via the WordPress hosting account (if `chfs-en.hzau.edu.cn` is WordPress)

1. Log into the hosting control panel (cPanel / Plesk / DirectAdmin).
2. Open the **File Manager** and navigate to the public web root (often `public_html/` or similar).
3. Create a new folder named exactly **`IPGS`**.
4. Upload everything from `ipgs-website/` into that folder (you can zip it, upload the zip, then extract).
5. Ensure WordPress's permalink/rewrite rules do not capture `/IPGS/*` — in most installs the standard WP `.htaccess` allows real subdirectories to take precedence. If it doesn't, add this line to the top of the parent WordPress `.htaccess`:
   ```
   RewriteRule ^IPGS - [L]
   ```

The IPGS site will then be fully independent of WordPress: separate HTML, separate CSS, separate admin.

---

## 3. Upload checklist

Before uploading, confirm the list below — this prevents 95 % of launch-day issues.

- [ ] Copy the **entire** `ipgs-website/` folder. Do not skip hidden files (`.htaccess`).
- [ ] Preserve the directory structure — `about/governance.html` must remain inside a `/about/` folder.
- [ ] Preserve file permissions: HTML/CSS/JS readable by the web-server user (typically 644); directories 755.
- [ ] Ensure the server serves `.svg` with MIME type `image/svg+xml` (default on Apache/Nginx).
- [ ] Confirm HTTPS is enabled for `chfs-en.hzau.edu.cn` so mixed-content warnings do not appear.
- [ ] Open `https://chfs-en.hzau.edu.cn/IPGS/` and verify:
  - The homepage loads, logo visible, announcement banner visible.
  - The seven nav items are clickable.
  - The Founding Meeting banner links to `/IPGS/founding-meeting.html`.
  - The membership page tables render.
  - The mobile hamburger menu works at narrow widths.

---

## 4. Quick test on your local machine

You can preview the site locally before uploading. From inside `ipgs-website/`:

```
# Python (already confirmed on your machine)
python -m http.server 8080

# Node (if you have it)
npx --yes serve . -l 3000
```

Then open <http://localhost:8080/> (or `:3000`).

---

## 5. Post-launch configuration (recommended)

| Task | Responsible | Notes |
|---|---|---|
| Replace placeholder email `secretariat@ipgs.org` with the provisional HZAU address | Secretariat | `ipgs-secretariat@mail.hzau.edu.cn` is a reasonable interim address. Global find-replace across the 14 HTML files. |
| Wire up real form handlers | Web developer | Forms currently show a client-side demo message. Recommended backends: **Formspree** (paid), **Netlify Forms** (if moving to Netlify), or a PHP endpoint on the existing CHFS server. |
| Enable Matomo or equivalent analytics | Secretariat + IT | Add a small snippet before `</body>` in each page, or via a shared footer include if moving to a templating system. |
| Submit `sitemap.xml` to search engines | Secretariat | Google Search Console + Baidu Webmaster Tools. |
| Provision real DNS (optional) | HZAU IT | `ipgs.hzau.edu.cn` as a subdomain is the recommended long-term host — see `IPGS_D_ImplementationRecommendation.md`. This site is ready for either subdirectory or subdomain deployment. |
| Legal review of `privacy.html` and `code-of-conduct.html` | HZAU legal team | Drafts only — ratify before public launch. |
| Add a Chinese-language version | Content team | Duplicate pages under `/zh/` and translate. All CSS supports CJK via Noto Sans SC in the font stack. |

---

## 6. Migrating to WordPress/Elementor later

If at some point the Secretariat wants to switch to WordPress + Elementor for Content Management:

1. Install WordPress fresh in `/IPGS` (separate database, separate admin).
2. Install Elementor Pro and a minimal theme (Hello Elementor).
3. In Elementor, import the design tokens from `css/style.css` into global settings: palette (green `#14532D`, gold `#B8860B`, etc.), typography (Inter).
4. Rebuild pages one-to-one using this static HTML as the reference. Most sections map directly to standard Elementor widgets (Heading, Text, Icon Box, Image, Button, Table).
5. Turn on the custom post types described in `IPGS_C_TechnicalRequirements.md` (Researcher, Institution, Working Group, Event, etc.).
6. Set up forms with Gravity Forms or Fluent Forms, matching the fields shown in the static HTML.
7. Redirect the static HTML URLs to their new WordPress equivalents via `.htaccess`.

The static site you are deploying today is not throwaway — it is a pixel-complete design reference that can be recreated in any CMS later.

---

## 7. Support and handover documents

These files accompany the deployment (one level up from this site folder):

- `IPGS_README.md` — full project handoff orientation.
- `IPGS_A_Sitemap.md` — complete sitemap, user journeys, cross-linking matrix.
- `IPGS_B_PageContent.md` — content drafts for every section (source of the copy in the HTML).
- `IPGS_C_TechnicalRequirements.md` — full functional/technical specification.
- `IPGS_D_ImplementationRecommendation.md` — hosting and URL-structure recommendation (subdomain vs. subdirectory).

---

## 8. If anything breaks

- **Fonts not loading:** the pages load Inter from Google Fonts. In networks where Google Fonts is blocked, self-host Inter by downloading the `.woff2` files and updating the `@font-face` in `css/style.css`. The system font stack (`-apple-system, Segoe UI, Helvetica Neue, Noto Sans SC`) is already listed as fallback, so the site remains readable without Google Fonts.
- **Mixed-content warning:** ensure every `src`/`href` is relative (they all are in this build) and that the server serves HTTPS.
- **Form submission does nothing:** the forms are wired to a demo handler in `js/main.js` that displays a client-side confirmation. For production submission, replace the `<form>` handler — see §5 above.
- **404 on `/IPGS/about/governance.html`:** confirm the `about/` subfolder was uploaded with its trailing slash preserved. Some FTP clients flatten directories on upload.

---

*End of deployment guide. The website is ready to go live.*
