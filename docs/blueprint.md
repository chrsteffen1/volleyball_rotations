# **App Name**: VolleyRotations

## Core Features:

- Interactive Diagram Editor: Allow coaches to create, modify, and visualize player positions for Serve Receive rotations and Defensive setups on a dynamic court.
- Player Circle Management: Provide draggable player circles for different roles (Setter, Middle, Right Side, Outside, Libero), each with a fixed color, label, and constrained by 'snap-to-court' boundaries.
- Defensive Preset Application: In defense mode, apply pre-defined 'Base 1' or 'Base 2' tactical positions for defenders with a single click, allowing for subsequent fine-tuning via dragging.
- Responsive Court Visualization: Render a visually accurate and responsive volleyball court featuring a dark grid background, white court lines, and normalized coordinates for consistent scaling across devices.
- Initial Data Provisioning: Automatically pre-populate the application with example Serve Receive rotations (1-6) and Defensive presets upon a new user's first login.  Rotation 1 includes: Right Side near right sideline and the net, Middle near the center line and the net, Outside on the left sideline, Libero near the center of the back line, Outside near the right sideline of the back line, Setter near the right sideline of the back line.
- Diagram Persistence: Enable users to load existing diagrams from a database. Users should not be able to create new diagrams.

## Style Guidelines:

- Primary color: A confident blue (#2681CC) symbolizing clarity and strategy, to be used for interactive elements and key features.
- Background color: A deep charcoal grey (#161A1C) with a subtle blue undertone, creating a focused, technical workspace reminiscent of the dark grid design.
- Accent color: A vibrant yellow (#F9D43C) for high-contrast highlights, call-to-action buttons, and to draw attention to critical information, inspired by the screenshot's bright text.
- Body and headline font: 'Inter' (sans-serif) for its modern, legible, and objective aesthetic, suitable for technical content and a clean UI.
- Use clean, minimalistic line icons that align with the geometric and modern feel of the application for player roles and interface actions.
- Implement a responsive design with a top navigation bar and a left-aligned control panel that collapses into a drawer on smaller screens, maintaining a centered, aspect-ratio-locked court canvas.
- Incorporate subtle, fluid animations for dragging player circles, modal transitions, and state changes (e.g., saving/loading) to enhance user feedback and experience.