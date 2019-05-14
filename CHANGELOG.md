# 1.1.5

- UA CID not functioning
- Added debug mode for logging (disabled by default)
- Improved changes made in 1.1.3

# 1.1.4

- Analytics.js removed
- UA now sends analytics with async POSTs
- Removed UA toggle click tracking in analytics

# 1.1.3

- Only rewrite Jakcodex project requests (instead of all hostname matches)

# 1.1.1 / 1.1.2

- Small UA fix

# 1.1.0

- Removed all URL auto update features  
- Added optional Usage Analytics

# 1.0.2

- Updated default URL list

# 1.0.1

- Removed remaining requestHeader references
- Added X-Jakcodex-CORS response header
- Fixed a glitch in displaying URLs when toggling enable back on
- Reorganized files a bit

# 1.0.0

- Forked from https://github.com/vitvad/Access-Control-Allow-Origin
- Ionic Framework upgraded to 1.3.3
- Removed usage of Bower due to being EOL
- Properly activates on browser startup and when toggled
- Automatic URL list updates available but off by default
- User configuration no longer included