# How to Add Your Demo GIF to README

## 📹 Creating Your Demo GIF

### Option 1: Using Screen Recording Tools

1. **iOS Simulator / Android Emulator:**
   - Record your screen using QuickTime (Mac) or screen recording tools
   - Convert to GIF using online tools like:
     - [ezgif.com](https://ezgif.com/)
     - [gifski](https://gif.ski/) (Mac app)
     - [ScreenToGif](https://www.screentogif.com/) (Windows)

2. **Physical Device:**
   - Use built-in screen recording (iOS: Control Center, Android: Quick Settings)
   - Transfer video to your computer
   - Convert to GIF using the tools above

### Recommended GIF Settings

- **Width:** 250-400px (for optimal display)
- **Frame Rate:** 10-15 fps
- **Duration:** 10-20 seconds
- **File Size:** < 5MB (for faster loading)

## 📁 Adding GIF to Your Repository

### Method 1: Store in Repository (Recommended)

1. Create an `assets` or `demo` folder in your repository root:

   ```bash
   mkdir assets
   ```

2. Add your GIF to the folder:

   ```
   assets/demo.gif
   ```

3. Update the README.md at line 34-39:
   ```markdown
   <div align="center">
     <img src="./assets/demo.gif" alt="React Native Tour Guide Demo" width="300" />
   </div>
   ```

### Method 2: Use External Hosting

1. Upload your GIF to:
   - [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
   - [Imgur](https://imgur.com/)
   - [Giphy](https://giphy.com/)

2. Get the direct link to the GIF

3. Update the README.md at line 34-39:
   ```markdown
   <div align="center">
     <img src="https://your-image-url.com/demo.gif" alt="React Native Tour Guide Demo" width="300" />
   </div>
   ```

## ✨ Example Demo Structure

Your demo should showcase:

1. **Setup** (1-2 seconds): Show the app before the tour starts
2. **Tour Start** (2-3 seconds): Show the first step with tooltip
3. **Navigation** (8-12 seconds): Show 3-4 tour steps
4. **Completion** (2 seconds): Show the tour ending

## 🎨 Tips for Great Demos

- ✅ Use a clean, professional example app
- ✅ Show different tooltip positions and shapes
- ✅ Demonstrate smooth transitions
- ✅ Keep it short and engaging
- ✅ Use a simple, uncluttered background
- ❌ Don't make it too long (> 25 seconds)
- ❌ Don't include personal information
- ❌ Avoid low-quality or choppy recordings

## 📝 Quick Replace Instructions

In your `README.md`, replace lines 34-39:

**Current:**

```markdown
<!-- 🎬 ADD YOUR DEMO GIF HERE -->
<!-- Replace this comment with your demo GIF -->
<!-- Recommended: Add a GIF showing your tour guide in action -->
<!-- Example: <img src="./demo.gif" alt="Demo" width="300" /> -->

**[📱 Add Demo GIF Here]**
```

**Replace with:**

```markdown
<img src="./assets/demo.gif" alt="React Native Tour Guide Demo" width="300" />
```

Or if using multiple demos:

```markdown
<table>
  <tr>
    <td align="center">
      <img src="./assets/demo-basic.gif" alt="Basic Tour" width="250" /><br />
      <sub>Basic Tour</sub>
    </td>
    <td align="center">
      <img src="./assets/demo-custom.gif" alt="Custom Styling" width="250" /><br />
      <sub>Custom Styling</sub>
    </td>
  </tr>
</table>
```

## 🚀 Ready to Go!

Once you've added your GIF, commit and push to GitHub:

```bash
git add assets/demo.gif README.md
git commit -m "docs: add demo GIF to README"
git push
```

Your professional npm library homepage is now complete! 🎉

