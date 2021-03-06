import { applyPlugins, mappers, parse } from 'parse-commit-message';

import { Auto, IPlugin } from '../../main';
import { VersionLabel } from '../../release';

export default class ConventionalCommitsPlugin implements IPlugin {
  name = 'Conventional Commits Parser';

  apply(auto: Auto) {
    auto.hooks.onCreateLogParse.tap(this.name, logParse => {
      logParse.hooks.parseCommit.tap(this.name, commit => {
        try {
          const [conventionalCommit] = applyPlugins(
            mappers.increment,
            parse(commit.subject)
          );

          if (conventionalCommit.header && conventionalCommit.increment) {
            commit.labels = [
              ...commit.labels,
              auto.semVerLabels!.get(
                conventionalCommit.increment as VersionLabel
              )!
            ];
          }
        } catch (error) {
          auto.logger.verbose.info(
            `No conventional commit message found for ${commit.hash}`
          );
        }

        return commit;
      });
    });
  }
}
