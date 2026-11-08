/* global $ */
$(function() {
  const project = decodeURIComponent(window.location.pathname.replace(/^\/|\/$/g, ''));
  const url = '/api/issues/' + encodeURIComponent(project);
  $('#projectTitle').text('All issues for: ' + project);

  function showError(xhr) {
    const message = xhr.responseJSON && xhr.responseJSON.error || 'Unable to complete the request';
    window.alert(message);
  }

  function loadIssues() {
    $.getJSON(url + window.location.search).done(function(issues) {
      const display = $('#issueDisplay').empty();
      issues.forEach(function(issue) {
        const status = issue.open ? 'open' : 'closed';
        const card = $('<div>').addClass('issue').addClass(status);
        card.append($('<p>').addClass('id').text('id: ' + issue._id));
        card.append($('<h3>').text(issue.issue_title + ' - (' + status + ')'));
        card.append($('<p>').text(issue.issue_text));
        card.append($('<p>').text(issue.status_text));
        card.append($('<p>').addClass('id').text('Created by: ' + issue.created_by + ' | Assigned to: ' + issue.assigned_to));
        card.append($('<p>').addClass('id').text('Created on: ' + issue.created_on + ' | Last updated: ' + issue.updated_on));
        if (issue.open) {
          card.append($('<a>').attr('href', '#').addClass('closeIssue').data('id', issue._id).text('close?'));
          card.append(' ');
        }
        card.append($('<a>').attr('href', '#').addClass('deleteIssue').data('id', issue._id).text('delete?'));
        display.append(card);
      });
    }).fail(showError);
  }

  function changeIssue(method, data) {
    $.ajax({ type: method, url, data }).done(function(result) {
      if (result.error) window.alert(result.error);
      else loadIssues();
    }).fail(showError);
  }

  $('#newIssue').submit(function(event) {
    event.preventDefault();
    const form = this;
    $.ajax({ type: 'POST', url, data: $(form).serialize() }).done(function(result) {
      if (result.error) window.alert(result.error);
      else { form.reset(); loadIssues(); }
    }).fail(showError);
  });
  $('#issueDisplay').on('click', '.closeIssue', function(event) {
    event.preventDefault();
    changeIssue('PUT', { _id: $(this).data('id'), open: false });
  });
  $('#issueDisplay').on('click', '.deleteIssue', function(event) {
    event.preventDefault();
    changeIssue('DELETE', { _id: $(this).data('id') });
  });
  loadIssues();
});
