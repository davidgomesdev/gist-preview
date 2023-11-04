(function () {
  function showMainPage() {
    document.getElementById('main').className = 'container';
    document.getElementById('loading').className += ' hide';
  }

  function showError(message) {
    document.getElementById('alert-box').innerHTML
      += '<div class="alert alert-danger">'
      +    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
      +    message
      +  '</div>';
  }

  function submit() {
    var query = document.getElementById('gist_id').value;
    var filename = document.getElementById('file_name').value;

    if (filename) {
      query += '/' + filename;
    }

    location.search = query;  // page will be refreshed
  }

  document.getElementById('submit').onclick = submit;

  var query = location.search.substring(1);

  if (query.length === 0) {
    console.info('Showing main page (no gist specified)');
    showMainPage();

    return;
  }

  // 2. get gist id and file name
  query = query.split('/');
  var gistId = query[0];
  var filename = decodeURIComponent(query[1] || '');

  // 3. write data to blank
  document.getElementById('gist_id').value = gistId;
  document.getElementById('file_name').value = filename;

  // 4. fetch data
  fetch('https://api.github.com/gists/' + gistId)
    .then(async function (res) {
      const body = await res.json();

      if (res.status === 200) {
        return body;
      }

      console.error(res, body); // debug

      throw new Error('Gist <strong>' + gistId + '</strong>, ' + body.message.replace(/\(.*\)/, ''));
    })
    .then(async function (info) {
      await loadHtml(filename, info.files);
      console.info('HTML Loaded successfully!');
    })
    .catch(function (err) {
      console.error('An error occurred!', err);
      showError(err.message);
    });
})();

async function loadHtml(filename, files) {
  if (filename === '') {
    filename = "index.html";
  }

  if (files.hasOwnProperty(filename) === false) {
    throw new Error('File <strong>' + filename + '</strong> is not exist');
  }

  var content = await getGistContent(files, filename);

  console.info('Adding HTML content...');
  console.debug('Content=' + content);
  document.write(content);

  if (files.hasOwnProperty('style.css') === true) {
    console.info('Adding CSS...');

    var cssContent = await getGistContent(files, 'style.css');

    addCss(cssContent);
  }
}

async function getGistContent(gistFiles, filename) {
  var rawUrl = gistFiles[filename].raw_url;
  return await (await fetch(rawUrl)).text();
}

function addCss(content) {
  var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = content;

  document.getElementsByTagName('head')[0].appendChild(style);
}
