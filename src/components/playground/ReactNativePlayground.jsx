
import { useState } from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

import {
  Smartphone,
  Code2,
  Terminal,
  RotateCcw,
  FolderTree,
} from "lucide-react";

const APP_CODE = `import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native-web";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>

      <Text style={styles.logo}>CODEVERSE</Text>

      <Text style={styles.title}>
        Hello, React Native!
      </Text>

      <Text style={styles.subtitle}>
        Build your first mobile application.
      </Text>

      <View style={styles.card}>

        <Text style={styles.counter}>
          {count}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>
            Increase Count
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setCount(0)}
        >
          <Text style={styles.resetText}>
            Reset
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#080812",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  logo: {
    color: "#a78bfa",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 20,
  },

  title: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },

  card: {
    backgroundColor: "#171729",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },

  counter: {
    fontSize: 60,
    color: "#a78bfa",
    fontWeight: "bold",
    marginBottom: 25,
  },

  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },

  resetButton: {
    marginTop: 20,
    padding: 10,
  },

  resetText: {
    color: "#a78bfa",
    fontSize: 14,
  },
});`;

const INDEX_CODE = `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root"))
  .render(<App />);`;

const CSS_CODE = `html, body, #root {
  margin: 0;
  width: 100%;
  height: 100%;
}

* {
  box-sizing: border-box;
}

#root {
  display: flex;
  flex-direction: column;
}

body {
  background: #080812;
  font-family: Arial, sans-serif;
}`;

const FILES = {
  "/App.js": APP_CODE,
  "/index.js": INDEX_CODE,
  "/styles.css": CSS_CODE,
};

const CUSTOM_SETUP = {
  dependencies: {
    react: "18.2.0",
    "react-dom": "18.2.0",
    "react-native-web": "0.19.13",
  },
};

export default function ReactNativePlayground() {
  const [showFiles, setShowFiles] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  function resetPlayground() {
    if (
      window.confirm(
        "Reset React Native code to the default example?"
      )
    ) {
      setResetKey((previous) => previous + 1);
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#11111f]">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-4">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-cyan-500/10 p-3">
            <Smartphone
              size={24}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              React Native Playground
            </h2>

            <p className="text-xs text-gray-500">
              React Native · Mobile UI Development
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() => setShowFiles(!showFiles)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
              showFiles
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : "border-white/10 text-gray-400"
            }`}
          >
            <FolderTree size={16} />
            Files
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
              showConsole
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : "border-white/10 text-gray-400"
            }`}
          >
            <Terminal size={16} />
            Console
          </button>

          <button
            onClick={resetPlayground}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Reset
          </button>

        </div>

      </div>

      <SandpackProvider
        key={resetKey}
        template="react"
        theme="dark"
        files={FILES}
        customSetup={CUSTOM_SETUP}
        options={{
          activeFile: "/App.js",
          visibleFiles: [
            "/App.js",
            "/index.js",
            "/styles.css",
          ],
          autorun: true,
          autoReload: true,
          recompileMode: "delayed",
          recompileDelay: 700,
        }}
      >

        <div className="grid gap-px bg-white/10 xl:grid-cols-[1.3fr_1fr]">

          {/* Code Editor */}
          <div className="min-w-0 bg-[#11111f]">

            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm">

              <Code2
                size={18}
                className="text-purple-400"
              />

              Code Editor

            </div>

            <SandpackLayout
              style={{
                border: "none",
                borderRadius: 0,
              }}
            >

              {showFiles && (
                <SandpackFileExplorer
                  style={{
                    height: 650,
                    minWidth: 120,
                    maxWidth: 160,
                  }}
                />
              )}

              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                showRunButton
                wrapContent
                closableTabs
                style={{ height: 650 }}
              />

            </SandpackLayout>

          </div>

          {/* Mobile Preview */}
          <div className="min-w-0 bg-[#11111f]">

            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm">

              <Smartphone
                size={18}
                className="text-cyan-400"
              />

              Mobile Preview

              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-green-400" />

            </div>

            <div className="flex min-h-[650px] items-center justify-center overflow-hidden bg-[#090914] p-5">

              {/* Phone Frame */}
              <div className="relative w-full max-w-[340px] rounded-[42px] border-[7px] border-[#303044] bg-black p-1 shadow-2xl">

                {/* Camera */}
                <div className="absolute left-1/2 top-3 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

                <div className="overflow-hidden rounded-[32px]">

                  <SandpackPreview
                    showNavigator={false}
                    showRefreshButton={false}
                    showOpenInCodeSandbox={false}
                    style={{
                      height: 570,
                      width: "100%",
                    }}
                  />

                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-3 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-gray-500" />

              </div>

            </div>

          </div>

        </div>

        {/* Console */}
        {showConsole && (
          <div className="border-t border-white/10">

            <div className="flex items-center gap-2 px-4 py-3 text-sm">

              <Terminal
                size={17}
                className="text-purple-400"
              />

              Console Output

            </div>

            <SandpackConsole
              showHeader
              showResetConsoleButton
              style={{ height: 180 }}
            />

          </div>
        )}

      </SandpackProvider>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-gray-500">
        Powered by React Native Web · Browser-based
        mobile UI preview
      </div>

    </section>
  );
}
