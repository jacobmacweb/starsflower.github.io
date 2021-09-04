let languages = {};

function getParameterCaseInsensitive(object, key) {
    return object[Object.keys(object).filter(function(k) {
      return k.toLowerCase() === key.toLowerCase();
    })[0]];
  }

function condReplace(element, key, value) {
    if (element.text().trim().toLowerCase()==key) {
        element.text(value);
    }
}

function loadLang(lang_key) {
    localStorage.setItem('lang', lang_key);
    if (lang_key in languages) {
        // Use ?v=Date.now() to ensure we never load cached data
        $.getJSON(languages[lang_key].path + "?v=" + Date.now(), function (data) {
            $("[data-trans]").each(function (i) {
                let el = $(this);
                let trans = el.data('trans');
                
                // Set default to revert back to English
                if (el.data('phrase') === undefined) {
                    let text;
                    if (trans !== "") {
                        text = el.attr(trans);
                    } else {
                        text = el.text();
                    }
                    
                    el.attr('data-phrase', text);
                }
                
                let key = el.data('phrase').trim().toLowerCase();
                key = key.replace( /\s+/g, ' ')
                let res = getParameterCaseInsensitive(data, key);
                if (res !== undefined) {
                    if (trans !== "") {
                        el.attr(trans, res);
                    } else {
                        el.text(res);
                    }
                }
            })
        })
    } else if (lang_key === "en") {
        $("[data-trans]").each(function (i) {
            let el = $(this);
            let trans = el.data('trans');
            let res = el.data('phrase');

            if (res !== undefined) {
                if (trans !== "") {
                    el.attr(trans, res);
                } else {
                    el.text(res);
                }
            }
        });
    }
}

$(document).ready(function () {
    // Use ?v=Date.now() to ensure we never load cached data
    $.getJSON('/i18n/_index.json?v=' + Date.now(), function (data) {
        languages = data;
    }).then(function () {
        let language = window.navigator.userLanguage || window.navigator.language;
        
        if (localStorage.getItem('lang') === null) {
            localStorage.setItem('lang', language);
        } else {
            language = localStorage.getItem('lang');
        }

        language = language.split('-')[0]; // Avoid national dialects (en-US -> en, etc)
        console.log("Loading language: " + language);

        if (languages.hasOwnProperty(language)) {
            loadLang(language);
        } else {
            loadLang('en');
        }
    })

    $("[data-set-language").on("click", function () {
        let language = $(this).data("set-language");
        if (language) {
            loadLang(language);
        }
    })
})