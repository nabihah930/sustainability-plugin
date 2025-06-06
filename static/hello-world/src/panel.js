// static/hello-world/src/panel.js
import React, { useState, useEffect } from "react";
import { view, invoke } from "@forge/bridge";

const CHECKLIST_ITEMS = [
  {
    id: "1.2.2 Captions (Prerecorded) (A)",
    description: "Essential for all videos with speech content."
  },
  {
    id: "1.2.4 Captions (Live) (AA)",
    description: "Important for live streams, TV broadcasts."
  },
  {
    id: "1.2.5 Audio Description (Prerecorded) (AA)",
    description: "Supports blind/visually impaired users."
  },
  {
    id: "1.4.3 Contrast (Minimum) (AA)",
    description: "Make sure text and UI are visible on TV screens."
  },
  {
    id: "1.4.11 Non-text Contrast (AA)",
    description: "Icons, buttons, and indicators should stand out visually."
  },
  {
    id: "1.4.13 Content on Hover or Focus (AA)",
    description: "Crucial for remote navigation or hover states."
  },
  {
    id: "2.1.1 Keyboard (A)",
    description: "Supports remote control / keyboard-based navigation."
  },
  {
    id: "2.4.3 Focus Order (A)",
    description: "Focus must follow a logical UI flow (e.g. remote navigation)."
  },
  {
    id: "2.4.7 Focus Visible (AA)",
    description: "Make sure focus indicators are clear (for remotes/keyboards)."
  },
  {
    id: "2.5.8 Target Size (Minimum) (AA)",
    description: "Critical for remote control precision—buttons must be large enough."
  },
  {
    id: "3.3.2 Labels or Instructions (A)",
    description: "For search bars, login, subscriptions, etc."
  },
  {
    id: "4.1.2 Name, Role, Value (A)",
    description: "Ensure compatibility with screen readers and smart TV voice assistants."
  }
];

export default function Panel() {
  const [issueKey, setIssueKey] = useState();
  const [status, setStatus] = useState();
  const [checks, setChecks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const initializePanel = async () => {
      try {
        // Get context first
        const context = await view.getContext();
        console.log('Panel Context:', context);

        // Try multiple ways to get the issue key
        let key = null;

        // 1. Try from context
        if (context?.platformContext?.issueKey) {
          key = context.platformContext.issueKey;
        } 
        // 2. Try from issue field in context
        else if (context?.extension?.issue?.key) {
          key = context.extension.issue.key;
        }
        // 3. Try from URL
        else {
          // Look for different URL patterns
          const url = window.location.href;
          const patterns = [
            /\/browse\/([A-Z][A-Z0-9_]+-[0-9]+)/i,  // matches PROJ-123
            /selectedIssue=([A-Z][A-Z0-9_]+-[0-9]+)/i,  // matches selectedIssue=PROJ-123
            /issues\/([A-Z][A-Z0-9_]+-[0-9]+)/i  // matches issues/PROJ-123
          ];

          for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
              key = match[1];
              break;
            }
          }
        }

        console.log('Extracted issue key:', key);

        if (!key) {
          throw new Error('Could not determine issue key from context or URL');
        }

        setIssueKey(key);

        // Get current sprint id
        const sprint = await invoke('getCurrentSprint', {});
        if (!sprint || !sprint.sprintId) {
          throw new Error('Could not determine current sprint');
        }
        const sprintId = sprint.sprintId;

        // Get status, checks, and submitted state in parallel
        const [statusResult, checksResult, submittedResult] = await Promise.all([
          invoke('getIssueStatus', { issueKey: key }),
          invoke('getSavedChecks', { issueKey: key }),
          invoke('getChecklistSubmitted', { issueKey: key })
        ]);

        console.log('Status result:', statusResult);
        console.log('Checks result:', checksResult);

        setStatus(statusResult);
        setChecks(checksResult || {});
        setSubmitted(Boolean(submittedResult && submittedResult.submitted));
      } catch (err) {
        console.error('Panel initialization failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializePanel();
  }, []);

  // Prevent any further changes if submitted
  const handleCheckChange = async (itemId, checked) => {
    if (submitted) return;
    const next = { ...checks, [itemId]: checked };
    setChecks(next);
    await invoke("saveChecks", {
      issueKey,
      checklist: next,
    });
  };

  const handleReadAll = async () => {
    if (submitted) return;
    const allChecked = CHECKLIST_ITEMS.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {});
    setChecks(allChecked);
    await invoke("saveChecks", {
      issueKey,
      checklist: allChecked,
    });
  };

  const handleSubmitChecklist = async (e) => {
    e.preventDefault();
    if (submitted) return;
    try {
      await invoke("submitChecklist", {
        issueKey,
        checklist: checks,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit checklist: " + err.message);
    }
  };

  // Show loading state
  if (loading) {
    return <div style={{ padding: '16px' }}>Loading checklist...</div>;
  }

  // Show error state
  if (error) {
    return <div style={{ padding: '16px', color: 'red' }}>{error}</div>;
  }

  // Check if status is Done (case insensitive)
  const isDoneStatus = status && [
    'done',
    'completed',
    'finished'
  ].includes(status.toLowerCase());

  // Only show checklist for Done items
  if (!isDoneStatus) {
    return (
      <div style={{ padding: '16px' }}>
        Accessibility checklist will appear once this issue is moved to{" "}
        <strong>Done</strong>. Current status: {status}
      </div>
    );
  }

  // render the actual checklist 
  return (
    <div style={{ padding: "16px", fontFamily: "inherit" }}>
      <h3>Accessibility Checklist</h3>
      <form onSubmit={handleSubmitChecklist}>
        {CHECKLIST_ITEMS.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: "16px",
              padding: "12px",
              border: "1px solid #dfe1e6",
              borderRadius: "3px",
              backgroundColor: checks[item.id] ? "#f4f5f7" : "white",
              opacity: submitted ? 0.6 : 1 // Visually indicate disabled state
            }}
          >
            <label style={{ display: "block", cursor: submitted ? "not-allowed" : "pointer" }}>
              <input
                type="checkbox"
                checked={Boolean(checks[item.id])}
                disabled={submitted}
                onChange={(e) => handleCheckChange(item.id, e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <strong>{item.id}</strong>
            </label>
            <p style={{
              margin: "8px 0 0 24px",
              color: "#5e6c84",
              fontSize: "13px"
            }}>
              {item.description}
            </p>
          </div>
        ))}

        <button
          type="button"
          onClick={handleReadAll}
          disabled={submitted}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            backgroundColor: submitted ? "#ccc" : "#0052CC",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: submitted ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          onMouseOver={(e) => { if (!submitted) e.target.style.backgroundColor = "#0065FF"; }}
          onMouseOut={(e) => { if (!submitted) e.target.style.backgroundColor = "#0052CC"; }}
        >
          Read all criteria points
        </button>

        <br />
        <button
          type="submit"
          disabled={submitted}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            backgroundColor: submitted ? "#ccc" : "#36B37E",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: submitted ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          {submitted ? "Checklist Submitted" : "Submit Checklist"}
        </button>
      </form>
      {submitted && (
        <div style={{ marginTop: "16px", color: "#36B37E", fontWeight: "bold" }}>
          Checklist has been submitted and saved for this issue.
        </div>
      )}
    </div>
  );
}
