
import { SANDBOX_TEMPLATES } from "@codesandbox/sandpack-react";

// Shared starter application styling
const createStyles = (accent) => `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Inter, Arial, sans-serif;
    background: #080812;
    color: #ffffff;
  }

  .cv-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
      radial-gradient(
        circle at top right,
        ${accent}25,
        transparent 45%
      ),
      #080812;
  }

  .cv-card {
    width: 100%;
    max-width: 440px;
    padding: 32px;
    border: 1px solid ${accent}35;
    border-radius: 24px;
    background: #141422;
    text-align: center;
    box-shadow: 0 20px 60px #00000050;
  }

  .cv-logo {
    width: 70px;
    height: 70px;
    margin: 0 auto 20px;
    display: grid;
    place-items: center;
    border-radius: 20px;
    background: ${accent}20;
    color: ${accent};
    font-size: 32px;
    font-weight: bold;
  }

  .cv-badge {
    display: inline-block;
    padding: 7px 12px;
    border-radius: 30px;
    background: ${accent}15;
    color: ${accent};
    font-size: 11px;
    letter-spacing: 2px;
    font-weight: bold;
  }

  h1 {
    font-size: 30px;
    margin: 18px 0 10px;
  }

  h2 {
    margin: 12px 0;
  }

  p {
    color: #a1a1b5;
    font-size: 14px;
    line-height: 1.7;
  }

  .cv-counter {
    margin: 25px 0;
    font-size: 64px;
    font-weight: bold;
    color: ${accent};
  }

  .cv-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  button {
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    background: ${accent};
    color: #080812;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  }

  button:hover {
    transform: translateY(-2px);
    opacity: 0.85;
  }

  button:active {
    transform: scale(0.96);
  }

  .cv-secondary {
    background: #27273b;
    color: #ffffff;
  }

  .cv-input-row {
    display: flex;
    gap: 8px;
    margin: 24px 0;
  }

  input {
    min-width: 0;
    flex: 1;
    padding: 12px;
    background: #080812;
    color: white;
    border: 1px solid #333348;
    border-radius: 10px;
    outline: none;
  }

  input:focus {
    border-color: ${accent};
  }

  .cv-task {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px;
    margin-bottom: 10px;
    border-radius: 12px;
    background: #202031;
    text-align: left;
    font-size: 14px;
  }

  .cv-task span {
    flex: 1;
    overflow-wrap: anywhere;
  }

  .cv-task button {
    padding: 6px 10px;
    font-size: 12px;
  }

  .cv-task input {
    flex: none;
    accent-color: ${accent};
  }

  .cv-done {
    text-decoration: line-through;
    opacity: 0.5;
  }

  .cv-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 24px 0;
  }

  .cv-stat {
    padding: 20px 10px;
    background: #202031;
    border-radius: 14px;
  }

  .cv-stat strong {
    display: block;
    color: ${accent};
    font-size: 28px;
    margin-bottom: 8px;
  }

  .cv-stat span {
    font-size: 12px;
    color: #a1a1b5;
  }

  .cv-progress {
    height: 10px;
    overflow: hidden;
    background: #29293d;
    border-radius: 20px;
    margin: 15px 0;
  }

  .cv-progress-fill {
    height: 100%;
    background: ${accent};
    border-radius: 20px;
    transition: width 0.3s;
  }

  .cv-footer {
    margin-top: 28px;
    color: #77778e;
    font-size: 11px;
    letter-spacing: 2px;
  }

  @media (max-width: 400px) {
    .cv-page {
      padding: 12px;
    }

    .cv-card {
      padding: 22px 16px;
    }

    h1 {
      font-size: 25px;
    }
  }
`;

// Find the correct file path in the installed Sandpack template
function findTemplateFile(template, candidates) {
  const files = SANDBOX_TEMPLATES[template]?.files || {};
  const paths = Object.keys(files);

  for (const candidate of candidates) {
    const match = paths.find(
      (path) =>
        path === candidate ||
        path.endsWith(candidate)
    );

    if (match) return match;
  }

  throw new Error(
    `Unable to find starter file for ${template}. Available files: ${paths.join(", ")}`
  );
}

// React starter application
const REACT_CODE = `
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <style>{\`${createStyles("#61dafb")}\`}</style>

      <main className="cv-page">
        <div className="cv-card">

          <div className="cv-logo">⚛</div>

          <span className="cv-badge">
            REACT PLAYGROUND
          </span>

          <h1>Interactive Counter</h1>

          <p>
            Learn React state management
            with the useState hook.
          </p>

          <div className="cv-counter">
            {count}
          </div>

          <div className="cv-actions">

            <button onClick={() => setCount(count - 1)}>
              − Decrease
            </button>

            <button onClick={() => setCount(count + 1)}>
              + Increase
            </button>

          </div>

          <div className="cv-actions">

            <button
              className="cv-secondary"
              onClick={() => setCount(0)}
            >
              Reset Counter
            </button>

          </div>

          <div className="cv-footer">
            CODEVERSE • REACT
          </div>

        </div>
      </main>
    </>
  );
}
`;

// TypeScript starter application
const TYPESCRIPT_CODE = `
import "./codeverse.css";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

let tasks: Task[] = [
  {
    id: 1,
    title: "Learn TypeScript",
    completed: true
  },
  {
    id: 2,
    title: "Build a project",
    completed: false
  }
];

document.body.innerHTML = \`
  <main class="cv-page">
    <div class="cv-card">

      <div class="cv-logo">TS</div>

      <span class="cv-badge">
        TYPESCRIPT PLAYGROUND
      </span>

      <h1>Task Manager</h1>

      <p>
        Practice interfaces, types and DOM manipulation.
      </p>

      <form class="cv-input-row" id="task-form">
        <input
          id="task-input"
          placeholder="Enter a new task..."
        />
        <button type="submit">Add</button>
      </form>

      <div id="task-list"></div>

      <p id="task-count"></p>

      <div class="cv-footer">
        CODEVERSE • TYPESCRIPT
      </div>

    </div>
  </main>
\`;

const form = document.querySelector<HTMLFormElement>(
  "#task-form"
)!;

const input = document.querySelector<HTMLInputElement>(
  "#task-input"
)!;

const taskList = document.querySelector<HTMLDivElement>(
  "#task-list"
)!;

const taskCount = document.querySelector<HTMLParagraphElement>(
  "#task-count"
)!;

function renderTasks(): void {
  taskList.replaceChildren();

  tasks.forEach((task: Task) => {
    const row = document.createElement("div");
    row.className = "cv-task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      renderTasks();
    });

    const title = document.createElement("span");
    title.textContent = task.title;

    if (task.completed) {
      title.className = "cv-done";
    }

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      tasks = tasks.filter(
        (item) => item.id !== task.id
      );
      renderTasks();
    });

    row.append(checkbox, title, removeButton);
    taskList.appendChild(row);
  });

  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  taskCount.textContent =
    completed + " of " + tasks.length + " tasks completed";
}

form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const title = input.value.trim();

  if (!title) return;

  tasks.push({
    id: Date.now(),
    title,
    completed: false
  });

  input.value = "";
  renderTasks();
});

renderTasks();
`;

// Vue.js starter application
const VUE_CODE = `
<script setup>
import { ref, computed } from "vue";

const newTask = ref("");

const tasks = ref([
  {
    id: 1,
    title: "Learn Vue.js",
    completed: true
  },
  {
    id: 2,
    title: "Create a component",
    completed: false
  }
]);

const completedCount = computed(() =>
  tasks.value.filter(task => task.completed).length
);

function addTask() {
  if (!newTask.value.trim()) return;

  tasks.value.push({
    id: Date.now(),
    title: newTask.value.trim(),
    completed: false
  });

  newTask.value = "";
}

function removeTask(id) {
  tasks.value = tasks.value.filter(
    task => task.id !== id
  );
}
</script>

<template>
  <main class="cv-page">
    <div class="cv-card">

      <div class="cv-logo">V</div>

      <span class="cv-badge">
        VUE PLAYGROUND
      </span>

      <h1>My To-Do List</h1>

      <p>
        Explore reactive state, computed properties
        and Vue directives.
      </p>

      <form
        class="cv-input-row"
        @submit.prevent="addTask"
      >
        <input
          v-model="newTask"
          placeholder="Add a new task..."
        />

        <button type="submit">
          Add
        </button>
      </form>

      <div
        v-for="task in tasks"
        :key="task.id"
        class="cv-task"
      >
        <input
          type="checkbox"
          v-model="task.completed"
        />

        <span :class="{ 'cv-done': task.completed }">
          {{ task.title }}
        </span>

        <button @click="removeTask(task.id)">
          Remove
        </button>
      </div>

      <p>
        {{ completedCount }} of
        {{ tasks.length }} tasks completed
      </p>

      <div class="cv-footer">
        CODEVERSE • VUE.JS
      </div>

    </div>
  </main>
</template>

<style>
${createStyles("#42b883")}
</style>
`;

// Svelte starter application
const SVELTE_CODE = `
<script>
  let count = 0;

  function increase() {
    count += 1;
  }

  function decrease() {
    count -= 1;
  }

  function reset() {
    count = 0;
  }
</script>

<main class="cv-page">
  <div class="cv-card">

    <div class="cv-logo">S</div>

    <span class="cv-badge">
      SVELTE PLAYGROUND
    </span>

    <h1>Reactive Counter</h1>

    <p>
      Discover how Svelte automatically
      updates the interface when state changes.
    </p>

    <div class="cv-counter">
      {count}
    </div>

    <div class="cv-actions">
      <button type="button" on:click={decrease}>
        − Decrease
      </button>

      <button type="button" on:click={increase}>
        + Increase
      </button>
    </div>

    <div class="cv-actions">
      <button
        type="button"
        class="cv-secondary"
        on:click={reset}
      >
        Reset Counter
      </button>
    </div>

    <div class="cv-footer">
      CODEVERSE • SVELTE
    </div>

  </div>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: Inter, Arial, sans-serif;
    background: #080812;
    color: #ffffff;
  }

  .cv-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
      radial-gradient(
        circle at top right,
        #ff6b3525,
        transparent 45%
      ),
      #080812;
  }

  .cv-card {
    width: 100%;
    max-width: 440px;
    padding: 32px;
    border: 1px solid #ff6b3535;
    border-radius: 24px;
    background: #141422;
    text-align: center;
    box-shadow: 0 20px 60px #00000050;
  }

  .cv-logo {
    width: 70px;
    height: 70px;
    margin: 0 auto 20px;
    display: grid;
    place-items: center;
    border-radius: 20px;
    background: #ff6b3520;
    color: #ff6b35;
    font-size: 32px;
    font-weight: bold;
  }

  .cv-badge {
    display: inline-block;
    padding: 7px 12px;
    border-radius: 30px;
    background: #ff6b3515;
    color: #ff6b35;
    font-size: 11px;
    letter-spacing: 2px;
    font-weight: bold;
  }

  h1 {
    font-size: 30px;
    margin: 18px 0 10px;
  }

  p {
    color: #a1a1b5;
    font-size: 14px;
    line-height: 1.7;
  }

  .cv-counter {
    margin: 25px 0;
    font-size: 64px;
    font-weight: bold;
    color: #ff6b35;
  }

  .cv-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  button {
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    background: #ff6b35;
    color: #080812;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  }

  button:hover {
    transform: translateY(-2px);
    opacity: 0.85;
  }

  button:active {
    transform: scale(0.96);
  }

  .cv-secondary {
    background: #27273b;
    color: #ffffff;
  }

  .cv-footer {
    margin-top: 28px;
    color: #77778e;
    font-size: 11px;
    letter-spacing: 2px;
  }

  @media (max-width: 400px) {
    .cv-page {
      padding: 12px;
    }

    .cv-card {
      padding: 22px 16px;
    }

    h1 {
      font-size: 25px;
    }
  }
</style>
`;

// Angular starter application
const angularFiles =
  SANDBOX_TEMPLATES.angular?.files || {};

const angularUsesModule = Object.keys(angularFiles).some(
  (path) => path.endsWith("/app.module.ts")
);

const ANGULAR_CODE = `
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: ${!angularUsesModule},
  template: \`
    <main class="cv-page">
      <div class="cv-card">

        <div class="cv-logo">A</div>

        <span class="cv-badge">
          ANGULAR PLAYGROUND
        </span>

        <h1>Student Dashboard</h1>

        <p>
          Explore Angular components,
          event binding and property binding.
        </p>

        <div class="cv-stats">

          <div class="cv-stat">
            <strong>{{ lessons }}</strong>
            <span>Lessons Completed</span>
          </div>

          <div class="cv-stat">
            <strong>{{ xp }}</strong>
            <span>Experience Points</span>
          </div>

        </div>

        <p>Course Progress: {{ progress }}%</p>

        <div class="cv-progress">
          <div
            class="cv-progress-fill"
            [style.width.%]="progress"
          ></div>
        </div>

        <div class="cv-actions">

          <button
            (click)="completeLesson()"
            [disabled]="lessons >= totalLessons"
          >
            Complete Lesson
          </button>

          <button
            class="cv-secondary"
            (click)="reset()"
          >
            Reset
          </button>

        </div>

        <div class="cv-footer">
          CODEVERSE • ANGULAR
        </div>

      </div>
    </main>
  \`,
  styles: [\`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      color: white;
    }

    ${createStyles("#f43f5e")}

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  \`]
})
export class AppComponent {
  totalLessons = 20;
  lessons = 5;
  xp = 250;

  get progress(): number {
    return Math.round(
      (this.lessons / this.totalLessons) * 100
    );
  }

  completeLesson(): void {
    if (this.lessons < this.totalLessons) {
      this.lessons++;
      this.xp += 50;
    }
  }

  reset(): void {
    this.lessons = 5;
    this.xp = 250;
  }
}
`;

// Next.js starter application
const NEXTJS_CODE = `
"use client";

import { useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <style>{\`${createStyles("#a78bfa")}\`}</style>

      <main className="cv-page">
        <div className="cv-card">

          <div className="cv-logo">N</div>

          <span className="cv-badge">
            NEXT.JS PLAYGROUND
          </span>

          <h1>
            Build Your Future.
          </h1>

          <p>
            Learn modern web development
            and create powerful applications
            with Next.js.
          </p>

          <div className="cv-stats">

            <div className="cv-stat">
              <strong>9</strong>
              <span>Playgrounds</span>
            </div>

            <div className="cv-stat">
              <strong>∞</strong>
              <span>Possibilities</span>
            </div>

          </div>

          <div className="cv-actions">

            <button
              onClick={() => setStarted(!started)}
            >
              {started ? "Start Again" : "Get Started →"}
            </button>

          </div>

          {started && (
            <p style={{ color: "#a78bfa" }}>
              Welcome to your coding journey!
              Happy coding!
            </p>
          )}

          <div className="cv-footer">
            CODEVERSE • NEXT.JS
          </div>

        </div>
      </main>
    </>
  );
}
`;

// Resolve starter file paths
const reactPath = findTemplateFile("react", [
  "/App.js",
  "/App.jsx",
  "/App.tsx",
]);

const typescriptPath = findTemplateFile("vanilla-ts", [
  "/index.ts",
  "/main.ts",
]);

const vuePath = findTemplateFile("vue", [
  "/App.vue",
]);

const sveltePath = findTemplateFile("vite-svelte", [
  "/src/App.svelte",
]);

const angularPath = findTemplateFile("angular", [
  "/app.component.ts",
]);

const nextPath = findTemplateFile("nextjs", [
  "/app/page.tsx",
  "/app/page.jsx",
  "/app/page.js",
  "/pages/index.tsx",
  "/pages/index.jsx",
  "/pages/index.js",
]);

const typescriptCssPath =
  typescriptPath.substring(
    0,
    typescriptPath.lastIndexOf("/") + 1
  ) + "codeverse.css";

// Playground configurations
export const PLAYGROUNDS = [
  {
    id: "web",
    name: "Web Development",
    shortName: "Web",
    description: "HTML, CSS & JavaScript",
    symbol: "</>",
    color: "#fb923c",
    enabled: true,
  },
  {
    id: "react",
    name: "React",
    shortName: "React",
    description: "JSX & Components",
    symbol: "⚛",
    color: "#61dafb",
    template: "react",
    activeFile: reactPath,
    files: {
      [reactPath]: REACT_CODE,
    },
    enabled: true,
  },
  {
    id: "typescript",
    name: "TypeScript",
    shortName: "TypeScript",
    description: "Type-safe JavaScript",
    symbol: "TS",
    color: "#3178c6",
    template: "vanilla-ts",
    activeFile: typescriptPath,
    files: {
      [typescriptPath]: TYPESCRIPT_CODE,
      [typescriptCssPath]: createStyles("#60a5fa"),
    },
    enabled: true,
  },
  {
    id: "vue",
    name: "Vue.js",
    shortName: "Vue",
    description: "Progressive Framework",
    symbol: "V",
    color: "#42b883",
    template: "vue",
    activeFile: vuePath,
    files: {
      [vuePath]: VUE_CODE,
    },
    enabled: true,
  },
 {
  id: "svelte",
  name: "Svelte",
  shortName: "Svelte",
  description: "Reactive Components",
  symbol: "S",
  color: "#ff6b35",
  template: "vite-svelte",
  activeFile: sveltePath,
  files: {
    [sveltePath]: SVELTE_CODE,
  },
  enabled: true,
},
  {
    id: "angular",
    name: "Angular",
    shortName: "Angular",
    description: "TypeScript Framework",
    symbol: "A",
    color: "#dd0031",
    template: "angular",
    activeFile: angularPath,
    files: {
      [angularPath]: ANGULAR_CODE,
    },
    enabled: true,
  },
  {
    id: "react-native",
    name: "React Native",
    shortName: "React Native",
    description: "Mobile Development",
    symbol: "⚛",
    color: "#61dafb",
    enabled: true,
  },
  {
    id: "flutter",
    name: "Flutter",
    shortName: "Flutter",
    description: "Dart & Mobile Development",
    symbol: "F",
    color: "#38bdf8",
    enabled: true,
  },
  {
    id: "nextjs",
    name: "Next.js",
    shortName: "Next.js",
    description: "Full-Stack React",
    symbol: "N",
    color: "#ffffff",
    template: "nextjs",
    activeFile: nextPath,
    files: {
      [nextPath]: NEXTJS_CODE,
    },
    enabled: true,
  },
];
