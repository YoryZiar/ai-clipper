const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the end part with the correct logic
const fixedCode = code.replace(
/        if \(response\.text\) \{\n          const parsed = JSON\.parse\(response\.text\);\n          if \(parsed\.clips && parsed\.clips\.length > 0\) \{\n            return res\.json\(\{ source: "gemini", clips: parsed\.clips \}\);\n          \}\n\}/,
`        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.clips && parsed.clips.length > 0) {
            return res.json({ source: "gemini", clips: parsed.clips });
          }
        }
      } catch (err: any) {
        console.error("Gemini API generation error:", err);
        return res.status(500).json({ error: err.message || "Gagal menghubungi Gemini API" });
      }
    }
  }

  // If we reach here, it means neither API returned clips successfully and we haven't already returned an error.
  return res.status(500).json({ error: "Gagal menghasilkan klip dari AI Provider." });
});`);

fs.writeFileSync('server.ts', fixedCode);
