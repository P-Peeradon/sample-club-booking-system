# Elmore Student Union

Welcome to the **Elmore Student Union**! Inspired by *The Amazing World of Gumball*, this is a full-stack, cross-platform desktop application built for Elmore students to enroll, manage their academic advocacy requests, and join the wackiest clubs in school.

## Branding & User Experience

- **Cartoon-Themed Aesthetics:** A playful, vibrant, and nostalgic design system utilizing custom typography, bold borders, and vibrant color palettes inspired directly by *The Amazing World of Gumball*.
- **Interactive Micro-Animations:** Engaging hover states, bouncing elements, and animated transitions that make the interface feel alive, tactile, and highly responsive.
- **Immersive Dashboards:** Intuitive, widget-based layouts that allow students to seamlessly manage their lockers, join wacky clubs, and access campus services like Education Advocacy.
- **Thematic Consistency:** Every UI element, from the official Elmore Student ID cards to the administrative "Supernode Veto" badges, is deeply integrated into the show's lore to provide a delightful, immersive user journey.
- **Cross-Cultural Accessibility:** Fully localized interfaces across multiple languages (including English, Chinese, and Fijian) ensure the Elmore experience is globally accessible without sacrificing its unique charm.

## 1. Tech Stack

The application employs a robust, modern stack designed for an edge-device hub-and-spoke architecture:

- **Frontend Framework:** Next.js (App Router, exported as a static Single Page Application via `output: 'export'`)
- **UI & Styling:** React 18, Tailwind CSS (Custom themes, fonts, and dynamic cartoon aesthetics)
- **Desktop Runtime & Backend:** Tauri v2 (Rust-based)
- **Local Database (Spoke):** SQLite (Runs locally on student tablets via Tauri)
- **Central Database (Hub):** MySQL (Centralized hub for remote synchronization)
- **Inter-Process Communication:** Tauri IPC (`@tauri-apps/api/core`) for seamless communication between the React frontend and the Rust backend.

## 2. Installation and Setup

### Prerequisites
- Node.js (v18+) and npm/bun/yarn
- Rust and Cargo (for Tauri backend)
- Tauri CLI prerequisites (varies by OS, e.g., Visual Studio C++ Build Tools on Windows)

### Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Database Configuration (MySQL Hub):**
   Ensure your central MySQL server is running. Create a `.env.local` file in the root directory (or use `.env`) and configure your database variables:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=elmore_student_union
   DB_PASSWORD=your_secure_password
   DB_DATABASE=elmore_stop_two
   ```

3. **Run the Application:**
   Because this relies on Tauri to inject the backend and SQLite capabilities, you must run the application using the Tauri CLI. This will automatically build the Next.js static export and bundle it into the desktop window:
   ```bash
   npm run tauri dev
   ```

## 3. Database Schema and Architecture

The Elmore Student Union operates on a **Hub-and-Spoke Architecture**:
- **Spoke (Local Tablets):** Students interact with the app on school tablets running Tauri. Reads and writes are processed instantly against a local **SQLite** database, guaranteeing zero latency and offline availability during Elmore's frequent network outages.
- **Hub (Central Server):** A central **MySQL** database acts as the single source of truth. The Tauri Rust backend periodically synchronizes local SQLite transactions up to the MySQL hub.

### Schema Highlights:
- `users` / `students`: Core authentication data, avatars, and academic profiles (e.g., class grade, homeroom).
- `clubs` / `club_members`: Tracks club details, categories, and student memberships.
- `advocacy_reqs`: Education advocacy tickets where students ask for academic guidance or report problems.
- `study_groups` / `workshops`: Peer-led study groups and administrative workshops.

## 4. Locales and Internationalization

The Elmore Student Union natively supports **English (`en`)**, **Chinese (`zh`)**, and **Fijian (`fj`)**. These specific locales were chosen to maximize the economic and academic value of the application:

- **Fijian (`fj`) - Pacific Accessibility:** Implementing Pacific Island languages like Fijian provides immense academic value by empowering local communities with modern educational technology in their native tongue. Economically, it taps into emerging digital infrastructure markets in the Pacific, promoting digital literacy and providing a template for inclusive tech in developing regions.
- **Chinese (`zh`) - Global Reach:** Accommodating the Chinese language supports a massive global demographic and international student body. This increases the potential market reach of the application exponentially, facilitating cross-cultural academic exchange and fostering a diverse, interconnected student union environment.

## 5. Features & User Interaction

### Student Enrollment & Authentication
Users authenticate using their official Elmore Student ID (format: `EH-YYYYXXX`). The system utilizes local stateful tracking to keep students logged in across sessions on their assigned devices.

### Education Advocacy
Students facing academic hurdles can submit requests directly to the Student Union.
- **Interaction:** Users fill out a request form detailing their problem, guidance needs, or study group requests.
- **Administration:** Administrators (like Anais Watterson) can review these requests in a specialized dashboard, marking them as resolved, rejected, or invoking a "Supernode Veto" to revoke decisions based on Constitutional Violations.

### Club Directory
A vibrant bulletin board of active and pending school clubs.
- **Interaction:** Students can freely browse clubs by category, instantly join or leave them, and view real-time member rosters.
- **Pending Clubs:** Administrative users can review newly proposed clubs and approve or reject them.

### Study Groups & Workshops
A collaborative space for academic success.
- **Interaction:** Students can create peer-led study groups specifying the subject and classroom. They can also view and attend upcoming Academic Success Workshops posted by the administration.

## 6. Marketing Plan

To aggressively scale student and alumni engagement, the Elmore Student Union is targeting five strategic "beachhead" cities. Each location plays a specific role in our global expansion strategy:

- **Los Angeles, USA (The Origin):** As the canonical location of Elmore High School, LA is our foundational market. Focusing here solidifies our grassroots engagement, taps into the local cultural zeitgeist, and ensures we maintain a strong connection to our core student base.
- **Washington, D.C., USA (Policy & Advocacy Hub):** Establishing a presence in the nation's capital is crucial for our Education Advocacy features. It allows us to engage alumni in government and policy roles, align with national educational standards, and open avenues for foundational funding and institutional partnerships.
- **Beijing, China (Global Academic Scaling):** Representing a massive demographic of international students and a highly competitive academic market. Targeting Beijing (supported natively by our `zh` locale) exponentially increases our user base and fosters a powerful, cross-cultural alumni network.
- **Suva & Nadi, Fiji (Pacific Inclusion & Emerging Tech):** 
  - **Suva:** As the capital and educational hub of Fiji (home to major South Pacific universities), Suva is vital for connecting with academic leaders in the region.
  - **Nadi:** As the international gateway, it bridges local communities with the global network. 
  - *Strategy:* Supported by our `fj` locale, targeting these cities proves our platform's capability to operate in emerging digital infrastructures. It champions inclusive educational technology and builds deep loyalty in developing, underserved academic markets.

---
*Principal Brown strictly forbids running in the hallways. Enjoy your time at the Elmore Student Union!*
