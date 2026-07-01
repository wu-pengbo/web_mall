const fs = require("fs");
let c = fs.readFileSync("D:/桌面/gitlab/web_mall/src/views/UserWallet.vue", "utf-8");
c = c.replace(/\r\n/g, "\n");

// 1. Insert <div class="modal-body"> at line 2495 (after header close, before user info)
c = c.replace(
  "          </div>\n          \n              <div><label>\u53ef{{ freezeMode === 'freeze' ? '\u51bb\u7ed3' : '\u89e3\u51bb' }}\u91d1\u989d</label>",
  "          </div>\n          <div class=\"modal-body\">\n              <div><label>\u53ef{{ freezeMode === 'freeze' ? '\u51bb\u7ed3' : '\u89e3\u51bb' }}\u91d1\u989d</label>"
);

// 2. Remove the extra </div> at line 2561
// Find: </div>\n    </div>\n    <!-- ==================== \u5f39\u7a97\uff1a\u5145\u503c\u8be6\u60c5 ==================== -->
// Replace: remove the first </div>
c = c.replace(
  "    </div>\n    </div>\n\n    <!-- ==================== \u5f39\u7a97\uff1a\u5145\u503c\u8be6\u60c5 ==================== -->",
  "    </div>\n\n    <!-- ==================== \u5f39\u7a97\uff1a\u5145\u503c\u8be6\u60c5 ==================== -->"
);

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync("D:/桌面/gitlab/web_mall/src/views/UserWallet.vue", c, "utf-8");
console.log("Done");
