# CSS Modules Styling Standards

## Quick Reference

This rule works with:

- **React Standards** - Style React components properly
- **Unit Testing Standards** - Test CSS class application

## Core Principles

1. **Use CSS Modules** - All component styles must use `.module.css` files
2. **Maximum Depth of 1** - Never nest CSS selectors more than one level deep
3. **Component-Scoped** - Styles are automatically scoped to components
4. **Predictable Naming** - Use consistent naming conventions
5. **Avoid important overrides** - Only use if there is no other option

## File Structure

```
ComponentName/
├── index.tsx
├── ComponentName.module.css
└── ComponentName.test.tsx
```

## CSS Module Import

```typescript
import css from './ComponentName.module.css';

export const ComponentName = () => (
  <div className={css.componentName}>
    <div className={css.header}>Title</div>
    <div className={css.content}>Content</div>
  </div>
);
```

## CSS Structure Rules

### ✅ Allowed (Depth 1)

```css
.componentName {
  /* Root styles */
  display: flex;
  padding: 1rem;
  background: #fff;
}

.componentName .header {
  /* One level deep - OK */
  font-size: 1.5rem;
  font-weight: bold;
}

.componentName .content {
  /* One level deep - OK */
  margin-top: 1rem;
  line-height: 1.6;
}

.componentName .button {
  /* One level deep - OK */
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}
```

### ❌ Not Allowed (Depth 2+)

```css
.componentName {
  /* Root styles */
}

.componentName .header .title .text {
  /* Too deep - 3 levels! */
  color: #333;
}

.componentName .content .section .paragraph {
  /* Too deep - 3 levels! */
  margin-bottom: 1rem;
}
```

## Naming Conventions

### Root Class

- Must match component name in camelCase
- Example: `ComponentName` → `.componentName`

### Child Classes

- Use descriptive, semantic names
- Keep names short but clear
- Use camelCase consistently

```css
/* Good naming */
.userProfile {
  /* Root */
}

.userProfile .avatar {
  /* Child */
}

.userProfile .userInfo {
  /* Child */
}

.userProfile .actions {
  /* Child */
}
```

## Component Examples

### Simple Component

```tsx
// UserCard.tsx
import css from "./UserCard.module.css";

export const UserCard = ({ user }: { user: User }) => (
  <div className={css.userCard}>
    <img className={css.avatar} src={user.avatar} alt={user.name} />
    <div className={css.userInfo}>
      <h3 className={css.name}>{user.name}</h3>
      <p className={css.email}>{user.email}</p>
    </div>
    <button className={css.editButton}>Edit</button>
  </div>
);
```

```css
/* UserCard.module.css */
.userCard {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.userCard .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 1rem;
}

.userCard .userInfo {
  flex: 1;
  margin-right: 1rem;
}

.userCard .name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.userCard .email {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.userCard .editButton {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

## Responsive Design

### Media Queries

- Place media queries at the root level
- Use consistent breakpoint variables
- Mobile-first approach

```css
.componentName {
  /* Mobile styles */
  padding: 1rem;
  font-size: 1rem;
}

@media (min-width: 768px) {
  .componentName {
    /* Tablet styles */
    padding: 1.5rem;
    font-size: 1.1rem;
  }
}

@media (min-width: 1024px) {
  .componentName {
    /* Desktop styles */
    padding: 2rem;
    font-size: 1.2rem;
  }
}
```

## State and Modifiers

### Using CSS Classes for States

```css
.button {
  /* Base button styles */
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: #fff;
}

.button .primary {
  /* Primary button variant */
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.button .disabled {
  /* Disabled state */
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Component Usage

```tsx
const Button = ({ variant, disabled, children }: ButtonProps) => (
  <button
    className={`${css.button} ${css[variant]} ${disabled ? css.disabled : ""}`}
    disabled={disabled}
  >
    {children}
  </button>
);
```

## Best Practices

### 1. Keep Styles Focused

```css
/* Good: Each class has a single responsibility */
.header {
  font-size: 1.5rem;
  font-weight: bold;
}

.content {
  margin-top: 1rem;
  line-height: 1.6;
}
```

### 2. Use CSS Variables for Repeated Values

```css
:root {
  --primary-color: #007bff;
  --border-radius: 4px;
  --spacing-unit: 1rem;
}

.button {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-unit);
}
```

### 3. Avoid Magic Numbers

```css
/* Bad: Magic numbers */
.componentName {
  margin: 17px;
  padding: 23px;
}

/* Good: Semantic values */
.componentName {
  margin: var(--spacing-md);
  padding: var(--spacing-lg);
}
```

## Common Patterns

### Layout Components

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container .content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
```

### Form Components

```css
.formGroup {
  margin-bottom: 1rem;
}

.formGroup .label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.formGroup .input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
```

## Testing Considerations

### CSS Module Testing

- Test that CSS classes are applied correctly
- Verify responsive behavior
- Check accessibility features (focus states, etc.)

```tsx
it("applies correct CSS classes", () => {
  render(<UserCard user={mockUser} />);

  const card = screen.getByRole("article");
  expect(card).toHaveClass("userCard");

  const avatar = screen.getByAltText(mockUser.name);
  expect(avatar).toHaveClass("avatar");
});
```

## Automated Checks

- Verify CSS module file naming (`ComponentName.module.css`)
- Check for maximum nesting depth (1 level)
- Ensure root class matches component name
- Validate CSS syntax and formatting
- Check for unused CSS classes

## Remember

> "CSS Modules provide component-scoped styling with a maximum depth of 1 level. This keeps styles predictable, maintainable, and prevents specificity wars. Keep it simple, keep it shallow."

## Related Rules

- [React Standards](REACT.md) - For component structure and CSS module integration
- [Unit Testing Standards](TESTING_UNIT_STANDARDS.md) - For testing CSS class application
