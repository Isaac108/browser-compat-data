/* This file is a part of @mdn/browser-compat-data
 * See LICENSE file for more information. */

import { execSync } from 'node:child_process';

/**
 *
 * @param {string} command
 * @returns {string}
 */
export const exec = (command: string): string =>
  execSync(command, { encoding: 'utf8' }).trim();

/**
 *
 */
export const requireGitHubCLI = (): void => {
  const command = 'gh auth status';
  try {
    execSync(command, {
      encoding: 'utf8',
      stdio: 'ignore',
    });
  } catch (err) {
    console.trace(err);
    console.error(`Error: ${command} failed.`);
    console.error('The GitHub CLI is required.');
    console.error('See https://cli.github.com/ for installation instructions.');
    process.exit(1);
  }
};

/**
 * @returns {string}
 */
export const getLatestTag = (): string =>
  exec('git describe --abbrev=0 --tags');

/**
 *
 * @param {string} ref
 * @param {boolean} querySafe
 * @returns {string}
 */
export const getRefDate = (ref: string, querySafe = false): string => {
  const rawDateString = exec(`git log -1 --format=%aI ${ref}`);

  if (querySafe) {
    return rawDateString.replace('+', '%2B');
  }
  return rawDateString;
};

/**
 *
 * @param {string} endRef
 * @param {string} startRef
 * @param {boolean} urlSafe
 * @returns {string}
 */
export const buildQuery = (
  endRef: string,
  startRef: string,
  urlSafe: boolean,
): string => {
  let merged: string;
  if (!['HEAD', 'main'].includes(endRef)) {
    merged = `merged:${getRefDate(startRef, urlSafe)}..${getRefDate(
      endRef,
      urlSafe,
    )}`;
  } else {
    merged = `merged:>=${getRefDate(startRef, urlSafe)}`;
  }

  return `is:pr ${merged}`;
};

export type ReleaseYargs = {
  startVersionTag: string;
  endVersionTag: string;
};

/**
 *
 * @param {yargs} yargs
 */
export const releaseYargsBuilder = (yargs): void => {
  yargs.positional('start-version-tag', {
    type: 'string',
    defaultDescription: 'most recent tag',
    default: getLatestTag,
  });
  yargs.positional('end-version-tag', {
    type: 'string',
    default: 'main',
  });
};
