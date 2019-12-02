fetch("https://raw.githubusercontent.com/ifyouseewendy/verbose-disco/e4acedb7566935351286ec08c593873ccb31d50a/issues.json")
  .then(response => response.json())
  .then(function(issues) {
    var tasks = [];
    issues.forEach(function(issue) {
      tasks.push({
        id: issue.title,
        name: issue.title,
        start: issue.start_date.join("-"),
        end: issue.end_date.join("-"),
        progress: 100,
        dependencies: null,
        url: issue.url
      });
    });
    var gantt = new Gantt("#gantt", tasks, {
      view_mode: "Month",
      custom_popup_html: function(task) {
        // the task object will contain the updated
        // dates and progress value
        return `
          <div class="details-container">
            <div class="title">${task.name}</div>
            <p>${task.start} - ${task.end}</p>
            <p><a href="${task.url}" target="_blank" id="detail-link">Detail</a></p>
          </div>
        `;
      }
    });
  })
