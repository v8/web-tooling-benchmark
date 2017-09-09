DISTDIR = dist

CHAI_FILES = lib/chai/chai-pre.js lib/chai/chai.js lib/chai/chai-post.js lib/chai/chai-tests.js 
ESPREE_FILES = lib/espree/espree-pre.js lib/espree/espree.js lib/espree/espree-post.js lib/espree/espree-data.js lib/espree/espree-tests.js

all: $(DISTDIR) | $(DISTDIR)/chai.js $(DISTDIR)/espree.js $(DISTDIR)/run.js

$(DISTDIR)/chai.js: lib/base.js $(CHAI_FILES) lib/cli.js
	@cat $^ > $@

$(DISTDIR)/espree.js: lib/base.js $(ESPREE_FILES) lib/cli.js
	@cat $^ > $@

$(DISTDIR)/run.js: lib/base.js $(CHAI_FILES) $(ESPREE_FILES) lib/cli.js
	@cat $^ > $@

$(DISTDIR):
	@mkdir $@

clean:
	@rm -rf $(DISTDIR)
