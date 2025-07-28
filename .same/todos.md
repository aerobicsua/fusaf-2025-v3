# Todos

## Current Issues to Fix
- [ ] Media upload button still accessible without edit mode - reported by user, needs investigation and fix
- [ ] Coach registration not displaying already registered clubs

## Recently Completed (Version 450)
- [x] Fixed media gallery UI access control for club owners
- [x] Added editMode condition to media upload and delete buttons
- [x] Restored accidentally removed media gallery UI code
- [x] Added user message prompting to enable edit mode for media upload

## Media Gallery Test Instructions
1. Login as club owner (alyonafedosenko@gmail.com / Alyona_2024)
2. Navigate to club page
3. Verify "Add Media" button only appears when edit mode is enabled
4. Verify media delete buttons only appear when edit mode is enabled
5. Test media upload and persistence after logout/login
6. Test media persistence after page refresh

## Debugging Notes
- Content Too Large (413) errors in logs for large Base64 uploads
- Media API endpoints have detailed debug logging enabled
- Access control conditions: `isOwner && editMode` for media buttons
