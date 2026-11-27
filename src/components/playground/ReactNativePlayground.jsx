import FrameworkPlayground from "./FrameworkPlayground";
const APP_CODE = `import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native-web";
export default function App() {
  const [count, setCount] = useState(0);
  return <View style={styles.container}>
    <Text style={styles.logo}>CODEVERSE</Text>
    <Text style={styles.title}>Hello, React Native!</Text>
    <Text style={styles.subtitle}>Build your first mobile application.</Text>
    <View style={styles.card}>
      <Text style={styles.counter}>{count}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setCount(count + 1)}><Text style={styles.buttonText}>Increase Count</Text></TouchableOpacity>
      <TouchableOpacity style={styles.resetButton} onPress={() => setCount(0)}><Text style={styles.resetText}>Reset</Text></TouchableOpacity>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: {flex:1,minHeight:"100%",backgroundColor:"#080812",alignItems:"center",justifyContent:"center",padding:20},
  logo:{color:"#a78bfa",fontSize:14,fontWeight:"bold",letterSpacing:3,marginBottom:20},
  title:{color:"#ffffff",fontSize:25,fontWeight:"bold",textAlign:"center"},
  subtitle:{color:"#94a3b8",fontSize:14,textAlign:"center",marginTop:12},
  card:{backgroundColor:"#171729",borderRadius:20,padding:25,width:"100%",alignItems:"center",marginTop:30,borderWidth:1,borderColor:"#8b5cf6"},
  counter:{fontSize:60,color:"#a78bfa",fontWeight:"bold",marginBottom:25},
  button:{backgroundColor:"#7c3aed",borderRadius:12,padding:15,width:"100%",alignItems:"center"},
  buttonText:{color:"#ffffff",fontWeight:"bold",fontSize:15},
  resetButton:{marginTop:20,padding:10},resetText:{color:"#a78bfa",fontSize:14}
});`;
const INDEX_CODE = `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
createRoot(document.getElementById("root")).render(<App />);`;
const CSS_CODE = `html, body, #root { margin:0; width:100%; height:100%; } * { box-sizing:border-box; } #root { display:flex; flex-direction:column; } body { background:#080812; font-family:Arial,sans-serif; }`;
const framework = {id:"react-native",name:"React Native",symbol:"RN",color:"#22d3ee",description:"React Native Web · Browser-based mobile UI preview",template:"react",initialDevice:"mobile",activeFile:"/App.js",visibleFiles:["/App.js","/index.js","/styles.css"],files:{"/App.js":APP_CODE,"/index.js":INDEX_CODE,"/styles.css":CSS_CODE},customSetup:{dependencies:{react:"18.2.0","react-dom":"18.2.0","react-native-web":"0.19.13"}}};
export default function ReactNativePlayground(){return <FrameworkPlayground framework={framework}/>;}
