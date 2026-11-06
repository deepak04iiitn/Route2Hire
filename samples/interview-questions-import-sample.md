---
topic: Selenium WebDriver Basics
description: Core WebDriver interview questions for QA and SDET roles.
---

# Selenium WebDriver Basics

Optional intro text. If you omit frontmatter `description:`, this intro becomes the topic description.

## What is Selenium WebDriver?

Selenium WebDriver is a browser automation API that drives real browsers through native automation.

Key points:

- Supports Chrome, Firefox, Edge, Safari, and more
- Has language bindings for Java, Python, C#, JavaScript, etc.
- Forms the foundation of most modern UI test frameworks

```java
WebDriver driver = new ChromeDriver();
driver.get("https://example.com");
```

## Explain implicit wait vs explicit wait

### Implicit wait
A global timeout applied to all `findElement` / `findElements` calls for the lifetime of the driver.

### Explicit wait
A targeted wait for a specific condition on a specific element (e.g. clickable, visible).

1. Prefer explicit waits for flaky UI timing
2. Avoid mixing long implicit waits with explicit waits
3. Use `WebDriverWait` or FluentWait for conditions

## How do you handle dynamic elements?

Use resilient locators and waits:

| Approach | When to use |
| --- | --- |
| Explicit wait | Element appears after AJAX |
| Relative XPath / CSS | Attributes change often |
| Partial link / contains | Text is stable but IDs are not |

> Tip: Prefer `data-testid` attributes when the app team can add them.

## What is the Page Object Model?

Page Object Model (POM) is a design pattern where each page (or component) is represented by a class that:

1. Stores locators for that page
2. Exposes actions as methods (`login`, `search`, `submitForm`)
3. Keeps tests readable and reduces duplication

Example structure:

```text
pages/
  LoginPage.java
  HomePage.java
tests/
  LoginTest.java
```
