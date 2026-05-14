/* eslint-disable */
const { withXcodeProject, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TARGET_NAME = 'NotificationService';
const SOURCE_DIR = path.join('plugins', 'NotificationService');
const LOCALES = ['en', 'ar', 'fr', 'bn'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const withCopySources = (config) =>
  withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformRoot = cfg.modRequest.platformProjectRoot;
      const from = path.join(projectRoot, SOURCE_DIR);
      const to = path.join(platformRoot, TARGET_NAME);
      if (!fs.existsSync(from)) {
        throw new Error(
          `[withNotificationServiceExtension] Missing source folder at ${from}. ` +
            'Add NotificationService.swift, Info.plist, and locale .strings files there.'
        );
      }
      copyDir(from, to);
      return cfg;
    },
  ]);

const withTarget = (config, props = {}) =>
  withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const bundleId = `${props.parentBundleId || 'com.notifylocale.app'}.${TARGET_NAME}`;

    if (proj.pbxTargetByName(TARGET_NAME)) return cfg;

    const target = proj.addTarget(TARGET_NAME, 'app_extension', TARGET_NAME, bundleId);

    proj.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    proj.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
    proj.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);

    const group = proj.addPbxGroup(
      ['NotificationService.swift', 'Info.plist'],
      TARGET_NAME,
      TARGET_NAME
    );

    const groups = proj.hash.project.objects['PBXGroup'];
    Object.keys(groups).forEach((key) => {
      if (groups[key].name === cfg.modRequest.projectName || groups[key].path === cfg.modRequest.projectName) {
        proj.addToPbxGroup(group.uuid, key);
      }
    });

    proj.addSourceFile(
      `${TARGET_NAME}/NotificationService.swift`,
      { target: target.uuid },
      group.uuid
    );

    LOCALES.forEach((loc) => {
      proj.addResourceFile(
        `${TARGET_NAME}/${loc}.lproj/Localizable.strings`,
        { target: target.uuid },
        group.uuid
      );
    });

    const buildSettings = proj.pbxXCBuildConfigurationSection();
    Object.keys(buildSettings).forEach((key) => {
      const bs = buildSettings[key];
      if (bs.buildSettings && bs.buildSettings.PRODUCT_NAME === `"${TARGET_NAME}"`) {
        bs.buildSettings.INFOPLIST_FILE = `"${TARGET_NAME}/Info.plist"`;
        bs.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleId}"`;
        bs.buildSettings.SWIFT_VERSION = '5.0';
        bs.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
        bs.buildSettings.CODE_SIGN_STYLE = 'Automatic';
      }
    });

    return cfg;
  });

module.exports = (config, props) => {
  config = withCopySources(config);
  config = withTarget(config, props);
  return config;
};
