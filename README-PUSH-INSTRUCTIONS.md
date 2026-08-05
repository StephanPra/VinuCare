# Mage Contributions - VinuCare

Me folder eke, oyage group project eken (`vinucare-complete.zip`) mama identify karapu
oyage 5 contributions valata adala files tika thiyenawa:

1. **AI Chatbot** – `src/components/ChatBot.jsx`, `src/data/chatbotData.js`,
   `src/styles/chatbot.css`, chatbot icons, saha backend eke
   `backend/routes/chatbot.js`, `backend/data/chatbotKnowledge.js`,
   `backend/migrations/chatbot_unanswered.sql`
2. **Nurse Dashboard** – `src/pages/nurse/NurseDashboard.jsx`
3. **Shop Page** – `src/pages/shop/` folder eke ithin files tika + `src/styles/shop.css`
4. **View Profile Feature** – `src/pages/account/Profile.jsx` + `src/styles/profile.css`
5. **Footer** – `src/components/Footer.jsx` + `src/styles/nav-footer.css`
   (App.jsx eke import karana active footer eka methanin. `src/pages/reviews/Footer.jsx`
   kiyana eka unused duplicate ekak, eken skip kala.)

Meke sathe, oyage 5 features walata connect wena **shared/common files** tikath
ekathu kala (Icons, Avatar, Skeleton, ConfirmModal, ToastStack, UIFeedbackContext,
ThemeContext, PaymentModal, ExtraBanners, StaffMessages/StaffSettings, Admin
dashboard pages, api config, wagē). Me okkoma dan zip eke thiyenawa, so oyage
GitHub repo eke build karaddi/run karaddi import error ekak enne naha.

## ⚠️ Important – mata direct GitHub ekata push karanna bæ

Mama meka run wenne isolated sandbox ekaka, mata internet/network access
naha. Ee nisa mata oyage GitHub account ekata directly login welā push
karanna bæ. Ee wenuwata, me files tika oyata ready karala dunna — oyage
computer eken download karagena, oyage own GitHub repo ekata push karanna
puluwan (below instructions follow karala).

## Push karana widiha (step by step)

### Option A: Puthu repo ekak hදනවනම් (fresh repo)

```bash
# 1. Me zip eka download karagena, extract karanna
unzip vinucare-my-contributions.zip
cd vinucare-my-contributions

# 2. git init karala, github eke aluth repo ekakata connect karanna
git init
git add .
git commit -m "My contributions: AI chatbot, nurse dashboard, shop page, view profile, footer"

# 3. GitHub eke aluth repo ekak hදාගන්න (github.com -> New repository)
#    Eke URL eka copy karagena methanata danna:
git remote add origin https://github.com/<oyage-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### Option B: Existing group repo eke oyage own fork/branch ekakata

```bash
# 1. Group repo eka mula ma oyage GitHub ekata fork karanna (GitHub UI eken)
# 2. Fork eka clone karagannna
git clone https://github.com/<oyage-username>/VinuCare.git
cd VinuCare

# 3. Me zip file eke files, clone karapu folder eke same paths walata copy karanna
#    (e.g. src/components/ChatBot.jsx -> VinuCare/src/components/ChatBot.jsx)

# 4. Stage karala commit karala push karanna
git add .
git commit -m "My contributions: AI chatbot, nurse dashboard, shop page, view profile, footer"
git push origin main
```

## Note

- Oyage original project eke `.git` history eka balanakota, meaning ha commits
  okkoma team ekathuwa (`StephanPra/VinuCare` repo eke) welā thiyenne, so
  individual file-level "authorship" GitHub eken confirm karanna nam,
  `git log --oneline -- <file-path>` command eka use karala balanna puluwan
  monawada thawath commits thiyenne kiyala.
- Mekedi folder structure eka original project eke thiyena widiyatama
  thiyenawa (`src/...`, `backend/...`), ethakota oyage repo ekata copy karaddi
  ese paths tika match karanna.
