# 🎮 ACADEMIC SURVIVOR

**Academic Survivor** is a college-themed territory capture game inspired by classic arcade mechanics like *Qix* and *Paper.io*. Developed using HTML5, CSS3, and the Phaser 3 framework.

You play as a student navigating a dangerous academic environment where the only way to survive is to **capture territory by enclosing areas** while avoiding increasingly aggressive academic threats.

## 🚀 Play the Game

[Play Academic Survivor Live!](https://Shreesh-o.github.io/Academic_Survivor/)

---

## 🎯 Core Objective

* **Capture area** by forming closed loops.
* **Avoid enemies** and protect your active trail.
* **Progress through levels** as difficulty increases.
* Reach **75% total map capture to survive the semester**!

---

## 🧍 How to Play

* Use **WASD** or **Arrow Keys** to move.
* You are safe within your captured (green) territory.
* Moving outside your territory leaves a **trail**.
* **Connect back** to your captured area to complete a loop and capture the enclosed space.
* **Game Over** if an enemy touches you or your vulnerable trail!

---

## 👾 Enemies & Progression

Each level introduces stronger enemies representing academic threats:

| Level | Enemy       | Behavior                     |
| ----- | ----------- | ---------------------------- |
| 1     | Assignments | Slow, basic movement         |
| 2     | Practicals  | Faster, same size            |
| 3     | ISE Exams   | Bigger, moderate speed       |
| 4     | MSE         | Larger + faster              |
| 5     | ESE         | Very fast, high threat       |
| 6     | HOD (Boss)  | Extreme speed, global threat |

*Every time you capture 40% of the current area, the map expands and a new enemy spawns!*

---

## 🛠️ Running Locally

Since this game uses the Phaser framework and loads local assets, you'll need to run it through a local web server (opening `index.html` directly in the browser may cause CORS errors).

**Option 1: Python (if installed)**
1. Open your terminal in the project directory.
2. Run `python -m http.server 8000` (or `python3 -m http.server 8000`).
3. Open `http://localhost:8000` in your web browser.

**Option 2: VS Code**
1. Install the **Live Server** extension.
2. Right-click on `index.html` and select **Open with Live Server**.

**Option 3: Node.js (http-server)**
1. Install http-server globally: `npm install -g http-server`.
2. Run `http-server` in the project directory.

---

## 🚀 Deployment (GitHub Pages)

To deploy this game to GitHub Pages:
1. Push this repository to GitHub.
2. Go to your repository **Settings**.
3. Navigate to **Pages** on the left sidebar.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the **main** (or **master**) branch and click **Save**.
6. Wait a minute or two, and your game will be live at `https://<your-username>.github.io/<repo-name>/`!

---

## 💬 Final Note

> Built under pressure, powered by caffeine, deadlines, and the fear of detention.
