window.contentfulExtension.init(function(api) {
  function tinymceForContentful(api) {
    api.window.startAutoResizer();

    function tweak(param) {
      var t = param.trim();
      if (t === "false") {
        return false;
      } else if (t === "") {
        return undefined;
      } else {
        return t;
      }
    }

    var tb = tweak(api.parameters.instance.toolbar);
    var mb = tweak(api.parameters.instance.menubar);

    tinymce.init({
      selector: "#editor",
      plugins: api.parameters.instance.plugins,
      toolbar: tb,
      menubar: mb,
      max_height: 800,
      min_height: 600,
      autoresize_bottom_margin: 15,
      resize: false,
      image_caption: true,
      content_css: [
        'https://rawgit.com/filipelinhares/ress/master/dist/ress.min.css',
        'https://unpkg.com/basscss@8.0.2/css/basscss.min.css',
      ],
      init_instance_callback : function(editor) {
        var listening = true;

        function getEditorContent() {
          return editor.getContent() || '';
        }

        function getApiContent() {
          return api.field.getValue() || '';
        }

        function setContent(x) {
          var apiContent = x || '';
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent);
          }
        }

        setContent(api.field.getValue());

        api.field.onValueChanged(function(x) {
          if (listening) {
            setContent(x);
          }
        });

        function onEditorChange() {
          var editorContent = getEditorContent();
          var apiContent = getApiContent();

          if (editorContent !== apiContent) {
            //console.log('Setting content in api to: [' + editorContent + ']');
            listening = false;
            api.field.setValue(editorContent).then(function() {
              listening = true;
            }).catch(function(err) {
              console.log("Error setting content", err);
              listening = true;
            });
          }
        }

        var throttled = _.throttle(onEditorChange, 500, {leading: true});
        editor.on('change keyup setcontent blur', throttled);
      }
    });
  }

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.onload = onload;
    document.body.appendChild(script);
  }

  var sub = location.host == "contentful.staging.tiny.cloud" ? "cloud-staging" : "cloud";
  var apiKey = api.parameters.installation.apiKey;
  var channel = api.parameters.installation.channel;
  var tinymceUrl = "https://" + sub + ".tinymce.com/" + channel + "/tinymce.min.js?apiKey=" + apiKey;

  loadScript(tinymceUrl, function() {
    tinymceForContentful(api);
  });
});
