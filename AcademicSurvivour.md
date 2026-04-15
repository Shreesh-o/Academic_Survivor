# 🎮 ACADEMIC SURVIVOR — Territory Capture Game

---

## 🧠 Concept Overview

**“Academic Survivor”** is a college-themed territory capture game inspired by classic arcade mechanics like *Qix* and *Paper.io*.

You play as a student navigating a dangerous academic environment where the only way to survive is to **capture territory by enclosing areas** while avoiding increasingly aggressive academic threats.

Every move you make is risky — your trail is vulnerable, and one mistake can cost you the entire semester.

---

## 🎯 Core Objective

* Capture area by forming closed loops
* Avoid enemies and protect your trail
* Progress through levels as difficulty increases
* Reach **75% total map capture to survive the semester**

---

## 🎮 Gameplay Flow

### 1. Initial Load (Menu Screen)

* Background: Full academic map visible (zoomed out)
* Player is visible at the center (idle state)
* Title: **ACADEMIC SURVIVOR**
* UI Elements:

  * ▶️ **Start Semester**
  * 🔊 **Music Toggle (Top Right Corner)**

---

### 2. Game Start

When the player clicks **Start Semester**:

* Camera smoothly **zooms into the player**
* Visible area becomes limited (focused gameplay zone)
* Enemies spawn
* Gameplay begins

---

### 3. Core Gameplay Loop

Move → Draw Trail → Close Loop → Capture Area → Avoid Enemies → Repeat

---

## 🧍 Player Mechanics

* Controlled via **WASD / Arrow Keys**
* Leaves a **trail** when moving outside safe (captured) area
* Completing a loop captures enclosed space

---

## 🧵 Trail System

* Trail represents your active capture attempt
* Vulnerable to enemy collision
* Key behaviors:

  * Open trail → Dangerous state
  * Closed loop → Converts into captured area

---

## 📊 Area Capture System

* Area is captured when the player completes a closed loop
* Score is based on **percentage of total area captured**

---

## 🧠 Level Progression System

### Trigger:

* Every **40% of current area captured**

### Effects:

* Map expands (camera zooms out)
* New enemy type spawns
* Previous enemies remain active
* Difficulty increases

---

## 🗺 Dynamic Camera System

| Event             | Camera Behavior                       |
| ----------------- | ------------------------------------- |
| Menu Screen       | Fully zoomed out (entire map visible) |
| Game Start        | Zooms into player                     |
| 40% Capture       | Zooms out slightly                    |
| Level Progression | Expands playable region               |

---

## 👾 Enemy Progression System

Each level introduces stronger enemies:

| Level | Enemy       | Behavior                     |
| ----- | ----------- | ---------------------------- |
| 1     | Assignments | Slow, basic movement         |
| 2     | Practicals  | Faster, same size            |
| 3     | ISE Exams   | Bigger, moderate speed       |
| 4     | MSE         | Larger + faster              |
| 5     | ESE         | Very fast, high threat       |
| 6     | HOD (Boss)  | Extreme speed, global threat |

---

## 📈 Difficulty Scaling

As levels increase:

* Enemy speed increases
* Enemy count increases
* Map size expands
* Risk of large captures increases

---

## 🧠 Enemy Behavior

* Enemies move freely within the map
* Bounce or roam unpredictably
* Apply constant pressure on player movement

---

## 💀 Game Over Conditions

* Enemy collides with player
* Enemy collides with player’s trail

---

## 🪦 Failure Screen

Displays:

* Captured Area %

* Message examples:

  * “Detained: Better luck next sem 💀”
  * “Attendance insufficient. Semester failed 💀”
  * “HOD: See you next year 💀”

* Restart option:

  * 🔁 **Repeat Semester**

---

## 🏆 Win Condition

* Capture **≥ 75% of total map**

---

## 🎉 Victory Screen

Displays:

> “Congrats on surviving the semester, HOD will be waiting for u next sem”

---

## 🔊 Audio System

* Background music plays during game
* Toggle button available in menu
* Optional:

  * Capture sound
  * Collision sound
  * Level-up cue

---

## 🧩 Game States

| State    | Description     |
| -------- | --------------- |
| Boot     | Load assets     |
| Menu     | Title screen    |
| Playing  | Active gameplay |
| GameOver | Player defeated |
| Win      | Player victory  |

---

## ⚙️ Core Systems

### ✅ Implemented

* Player movement
* Trail system
* Area capture logic
* Enemy movement
* Collision detection
* Level progression
* Camera zoom system

---

### ⚠️ Optional Enhancements

* Power-ups (Proxy Attendance, Mass Bunker)
* Particle effects
* Sound effects
* Advanced enemy AI

---

## 🎮 Controls

| Key   | Action     |
| ----- | ---------- |
| W / ↑ | Move Up    |
| S / ↓ | Move Down  |
| A / ← | Move Left  |
| D / → | Move Right |
| ESC   | Pause      |
| R     | Restart    |

---

## 🧠 Game Loop Summary

Menu Screen
↓
Start Game
↓
Zoom Into Player
↓
Move & Draw Trail
↓
Capture Area
↓
Avoid Enemies
↓
Reach 40% → Level Up (Zoom Out + New Enemy)
↓
Repeat
↓
Reach 75% → WIN 🎉
OR
Collision → GAME OVER 💀

---

## 🏆 Key Highlights

* Unique **area-capture gameplay**
* Dynamic **camera zoom system**
* Progressive **enemy escalation**
* Risk vs reward mechanics
* Relatable academic theme with humor

---

## 🚀 Future Enhancements

* Multiplayer mode (territory wars)
* Online leaderboard
* Mobile support (touch controls)
* Procedural map expansion
* Boss AI (HOD path prediction)

---

## ⚠️ Development Note (Hackathon Focus)

Keep the game:

* Playable within 2 hours
* Smooth and responsive
* Focus on core mechanics:

  * Movement
  * Trail
  * Collision
  * Basic progression

Avoid over-engineering advanced features.

---

## 💬 Final Note

> Built under pressure, powered by caffeine, deadlines, and the fear of detention.

---
