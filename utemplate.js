(function () {

    var templateSettings = {
            evaluate:   /<%([\s\S]+?)%>/g,
            interpolate:/<%=([\s\S]+?)%>/g,
            escape:     /<%-([\s\S]+?)%>/g
        },

        noMatch = /(.)^/,

        escapes = {
            "'":     "'",
            '\\':    '\\',
            '\r':    'r',
            '\n':    'n',
            '\t':    't',
            '\u2028':'u2028',
            '\u2029':'u2029'
        },

        escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    function UTemplate(text, data) {
        var settings = templateSettings;

        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        var index = 0;
        var source = "__p+='";

        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text
                .slice(index, offset)
                .replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });

            source +=
                escape ? "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" :
                interpolate ? "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" :
                evaluate ? "';\n" + evaluate + "\n__p+='" : '';

            index = offset + match.length;
        });

        source += "';\n";

        if (!settings.variable) {
            source = 'with(obj||{}){\n' + source + '}\n';
        }

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        var render;

        try {
            render = new Function(settings.variable || 'obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) {
            return render(data);
        }

        var template = function (data) {
            return render.call(this, data);
        };

        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    }

    window.UTemplate = UTemplate;

})();