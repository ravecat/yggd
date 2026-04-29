const { VersionActions } = require("nx/release");

const VERSION_PATTERNS = [
  {
    regex: /^(\s*)@version\s+"([^"]+)"(\s*)$/m,
    replacement: (newVersion) => `$1@version "${newVersion}"$3`,
  },
  {
    regex: /^(\s*)version:\s+"([^"]+)"(,?)(\s*)$/m,
    replacement: (newVersion) => `$1version: "${newVersion}"$3$4`,
  },
];

class ElixirVersionActions extends VersionActions {
  validManifestFilenames = ["mix.exs"];

  readManifest(tree, manifestPath) {
    const content = tree.read(manifestPath)?.toString("utf-8");

    if (!content) {
      throw new Error(`Unable to read Elixir manifest: ${manifestPath}`);
    }

    const pattern = VERSION_PATTERNS.find((candidate) => content.match(candidate.regex));
    const match = pattern ? content.match(pattern.regex) : null;

    if (!match) {
      throw new Error(`Unable to find an Elixir version in ${manifestPath}`);
    }

    return {
      content,
      currentVersion: match[2],
      manifestPath,
      pattern,
    };
  }

  async readCurrentVersionFromSourceManifest(tree) {
    const { currentVersion, manifestPath } = this.readManifest(
      tree,
      this.manifestsToUpdate[0].manifestPath,
    );

    return {
      currentVersion,
      manifestPath,
    };
  }

  async readCurrentVersionFromRegistry() {
    return null;
  }

  async readCurrentVersionOfDependency() {
    return {
      currentVersion: null,
      dependencyCollection: null,
    };
  }

  async updateProjectDependencies() {
    return [];
  }

  async updateProjectVersion(tree, newVersion) {
    const logMessages = [];

    for (const { manifestPath } of this.manifestsToUpdate) {
      const { content, currentVersion, pattern } = this.readManifest(tree, manifestPath);
      const updatedContent = content.replace(pattern.regex, pattern.replacement(newVersion));

      tree.write(manifestPath, updatedContent);
      logMessages.push(`Updated ${manifestPath} from ${currentVersion} to ${newVersion}`);
    }

    return logMessages;
  }
}

module.exports = ElixirVersionActions;
