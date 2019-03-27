'use strict';

module.exports = function (data, options) {
  var MdIt = require('markdown-it');
  var cfg = this.config.markdown;
  var opt = (cfg) ? cfg : 'default';
  var parser = (opt === 'default' || opt === 'commonmark' || opt === 'zero') ?
    new MdIt(opt) :
    new MdIt(opt.render);

  if (opt.plugins) {
    parser = opt.plugins.reduce(function (parser, pugs) {
      if (pugs instanceof Object && pugs.name) {
        return parser.use(require(pugs.name), pugs.options);
      // 魔改开始 https://github.com/arve0/markdown-it-attrs/issues/72#issuecomment-431566521
      } else if (pugs == 'markdown-it-container') {
          return parser.use(require('markdown-it-container'), 'dynamic', {
            validate: function () {
              return true;
            },
            render: function (tokens, idx, options, env, slf) {
              var token = tokens[idx],
                className = token.info.trim(),
                renderedAttrs = slf.renderAttrs(token);
              if (token.nesting === 1) {
                return (className && className !== '{}') ?
                  '<div class="' + className + '">' :
                  '<div' + renderedAttrs + '>';
              } else {
                return '</div>';
              }
            }
          })
      // 魔改结束
      } else {
        return parser.use(require(pugs));
      }
    }, parser);
  }

  if (opt.anchors) {
    parser = parser.use(require('./anchors'), opt.anchors);
  }

  return parser.render(data.text);
};