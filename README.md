# 🥑 Nutri-Lens

Nutri-Lens is a highly-intelligent, AI-powered nutrition tracker and recipe recommendation engine. Built with modern web technologies and powered by state-of-the-art Multimodal Large Language Models, it helps users optimize their daily food intake perfectly to their physical goals while eliminating food waste.

---

## 🌟 Key Features

* **📷 LLaMA Vision Ingredient Detection**
  Upload, drag-and-drop, or paste a photo of your fridge. Nutri-Lens uses Meta's LLaMA Vision Model (`llama-4-scout-17b-16e-instruct` via Groq) to instantly detect semantic food profiles and populate your ingredient list.

* **🧠 Smart Palate-Learning AI**
  Rate the meals you've cooked in your **History Logs**. The AI securely learns your unique flavor preferences, actively recommending future recipes similar to your 4-and-5-star meals, explicitly avoiding flavor-profiles you disliked.

* **🎯 BMI & Goal-Adjusted Daily Macros**
  Nutri-Lens mathematically calculates your daily Total Daily Energy Expenditure (TDEE). Select specific goals (`muscle-gain`, `weight-loss`, `maintenance`), and the engine will dynamically adjust caloric surpluses, deficits, and protein multipliers while using your BMI as a heavy safety guardrail.

* **🛒 Predictive "Cook Now" Categorization**
  Powered by the **Spoonacular API**, recipes are strictly categorized as:
  * **"Cook Now":** Meals that can be made entirely with the ingredients you already have.
  * **"Worth the Grocery Run":** Meals that dynamically require just a few extra ingredients.

* **👨‍👩‍👧 Family Multi-Profile Tracking**
  Manage nutrition goals for multiple people simultaneously under a single Google OAuth authenticated account. Switch active profiles independently to generate custom meal plans.

* **✨ Premium Glassmorphism UI**
  A beautifully designed dark-mode architecture using Tailwind CSS and `framer-motion` for a deeply premium user experience.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 & Vite
* **Styling:** Tailwind CSS (v4)
* **Animation:** `framer-motion` & `canvas-confetti`
* **Authentication:** Google OAuth (`@react-oauth/google`)
* **AI & Language Models:** Groq Platform (LLaMA 3 / LLaMA 4 Vision)
* **Recipe Database Engine:** Spoonacular API
* **Routing:** `react-router-dom`

---

## 🚀 Getting Started

### Prerequisites

You need `Node.js` installed on your machine.

### Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone https://github.com/spiritcoffee/Nutri-Lens.git
   cd Nutri-Lens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory mapping your strict API keys and OAuth secrets:
   ```env
   VITE_GOOGLE_CLIENT_ID="[Your Google OAuth Client ID]"
   VITE_GROQ_API_KEY="[Your Groq API Key]"
   VITE_SPOONACULAR_API_KEY="[Your Spoonacular API Key]"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   > By default, the application will run at `http://localhost:5173`. Make sure to configure your Google Cloud OAuth consent screen to authorize `http://localhost:5173` as a valid Authorized redirect URI!

---

## 🔮 Roadmap

* **Macro Scanner:** Extract nutritional labels automatically using OCR.
* **Smart Grocery Lists:** Auto-populate a shopping list based on the "Additional Ingredients" needed for your saved recipes.

*Designed with ❤️ to make healthy eating effortless and incredibly delicious.*
