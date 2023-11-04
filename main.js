(function () {
  function showMainPage () {
    document.getElementById('main').className = 'container';  // remove class 'hide'
    document.getElementById('loading').className += ' hide';  // add class 'hide'
  }

  function showError (message) {
    document.getElementById('alert-box').innerHTML
      += '<div class="alert alert-danger">'
      +    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
      +    message
      +  '</div>';
  }

  function submit () {
    var query = document.getElementById('gist_id').value;
    var fileName = document.getElementById('file_name').value;
    if (fileName) {
      query += '/' + fileName;
    }
    location.search = query;  // page will be refreshed
  }

  document.getElementById('submit').onclick = submit;

  // 1. check query string
  var query = location.search.substring(1);
  if (query.length === 0) {
    showMainPage();
    return;
  }

  // 2. get gist id and file name
  query = query.split('/');
  var gistId = query[0];
  var fileName = decodeURIComponent(query[1] || '');

  // 3. write data to blank
  document.getElementById('gist_id').value = gistId;
  document.getElementById('file_name').value = fileName;

  // 4. fetch data
  fetch('https://api.github.com/gists/' + gistId)
    .then(async function (res) {
      const body = await res.json();

      if (res.status === 200) {
        return body;
      }

      console.log(res, body); // debug

      throw new Error('Gist <strong>' + gistId + '</strong>, ' + body.message.replace(/\(.*\)/, ''));
    })
    .then(function (info) {
      loadHtml(fileName, info);
    })
    .catch(function (err) {
      showMainPage();
      showError(err.message);
    });
})();

function loadHtml(fileName, info) {
  if (fileName === '') {
    fileName = "index.html";
  }

  if (info.files.hasOwnProperty(fileName) === false) {
    throw new Error('File <strong>' + fileName + '</strong> is not exist');
  }

  // 5. write data
  var content = info.files[fileName].content;
  document.write(content);

  //load links
  var links = document.querySelectorAll("link");

  for (let [_, value] of Object.entries(info.files)) {
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href").replace(/^\/|\/$/g, '');
      if (value.filename === href && value.type === "text/css") {
        console.log("load file " + value.filename);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = value.content;
        document.getElementsByTagName('head')[0].appendChild(style);
      }
    }
  }
}
