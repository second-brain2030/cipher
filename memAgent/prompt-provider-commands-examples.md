# Prompt Provider Commands: Example Usage

Below are example usages for all prompt-related commands in Cipher CLI. Each example includes a sample command and a dropdown with the expected output/result.

---

## 1. List Active and Available Providers

**Command:**

```bash
/prompt-providers list
```

<details>
<summary>Show Output</summary>

```
📋 System Prompt Providers (Enhanced Mode)
🟢 Active Providers:
  🟢 user-instruction (static)
  🟢 built-in-memory-search (static)
  ...
🟡 Available (Enabled, Not Yet Loaded):
  🟡 summary (dynamic)
  🟡 project-guidelines (file-based)
💡 Use /prompt-providers add-dynamic or add-file to activate more providers.
```

</details>

---

## 2. Show All Providers (Enabled and Disabled)

**Command:**

```bash
/prompt-providers show-all
```

<details>
<summary>Show Output</summary>

```
📋 All Providers (Enabled and Disabled)
🟢 Active:
  🟢 user-instruction (static)
  ...
🟡 Available (Enabled, Not Yet Loaded):
  🟡 summary (dynamic)
🔴 Disabled:
  🔴 project-guidelines (file-based)
💡 Use /prompt-providers enable/disable to manage provider status.
```

</details>

---

## 3. Add a Dynamic Provider

**Command:**

```bash
/prompt-providers add-dynamic summary --history 10
```

<details>
<summary>Show Output</summary>

```
✅ Dynamic provider 'summary' added/updated.
📝 Generated summary for 'summary':
Summary: The conversation covers project setup, coding standards, and collaboration rules.
```

</details>

---

## 4. Add a File-Based Provider

**Command:**

```bash
/prompt-providers add-file project-guidelines --summarize true
```

<details>
<summary>Show Output</summary>

```
💡 LLM summary generated and cached for file-based provider.
✅ File-based provider 'project-guidelines' added/updated.
```

</details>

---

## 5. Remove a Provider

**Command:**

```bash
/prompt-providers remove summary
```

<details>
<summary>Show Output</summary>

```
✅ Provider 'summary' removed.
```

</details>

---

## 6. Update a Provider’s Config

**Command:**

```bash
/prompt-providers update project-guidelines --summarize false
```

<details>
<summary>Show Output</summary>

```
✅ Provider 'project-guidelines' updated.
```

</details>

---

## 7. Enable a Provider

**Command:**

```bash
/prompt-providers enable project-guidelines
```

<details>
<summary>Show Output</summary>

```
✅ Provider 'project-guidelines' enabled.
```

</details>

---

## 8. Disable a Provider

**Command:**

```bash
/prompt-providers disable project-guidelines
```

<details>
<summary>Show Output</summary>

```
✅ Provider 'project-guidelines' disabled.
```

</details>

---

## 9. Show Current System Prompt

**Command:**

```bash
/prompt
```

<details>
<summary>Show Output</summary>

```
📝 Current System Prompt:
╭─ System Prompt ─────────────────────────────╮
│ You are an AI programming assistant ...     │
│ ...                                        │
╰─────────────────────────────────────────────╯
💡 Prompt length: 1200 characters
💡 Line count: 30 lines
```

</details>

---

## 10. Show Prompt Statistics

**Command:**

```bash
/prompt-stats
```

<details>
<summary>Show Output</summary>

```
📊 System Prompt Performance Statistics
🚀 **Enhanced Generation Performance**
   - Providers used: 7
   - Total prompt length: 1200 characters
   - Generation time: 120 ms
   - Success: ✅
```

</details>
