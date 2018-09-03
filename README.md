# Foundation
A simple react-native cli facade to make some of the trivial
native tasks simpler and easier.
1. Use [configuration](#configurations) instead of making changes to native code.
2. Make it easier to [release apps](#releasing) for android as well as iOS. Ready to deploy on Play Store and App Store.
3. Make react-native project [yarn workspaces](https://yarnpkg.com/en/docs/workspaces) friendly.
4. Provide a Splash screen for android as well.

*WARNING: This utility still needs a lot more testing with different use cases. It is however directly compatilbe with react-native cli, so you can always revert back to using react-native cli any time. Uses react-native version 0.56
while creating new project, but the utility should work with
prior react-native verions as well. [Read below for instructions](#existing-react-native-projects)*

## Installation
> `$ npm install -g react-native-foundation`

or

> `$ yarn global add react-native-foundation`

## Usage
### New Project
> `$ foundation create <ProjectName>`<br/>

This command works similar to `react-native init` except that
the project will not include the native sources, but a
`foundation.config.js` file, which could be used to configure
the most trivial native [configurations](#configurations).

> `$ foundation run-android`<br/>
> `$ foundation run-ios`<br/>

This command will build the native code and publish the app
on the connected device (simulator) for development purpose.
These command delegate their task to their respective
react-native commands, but before doing that, they make changes to the native code, to reflect back the configuration.

> `$ foundation start`<br/>

This command will start the packager, making sure that you
are able to run them with or without the native codes. It just
needs an `index.js` to serve. Will work even without a valid
node `package.json`.

> `$ foundation create-native`<br/>

You will almost always need to change the native code specially
when it comes to shipping. This command will create native
source `android` and `ios` on your **workspace** (yarn).
Note that if you have multiple react-native project on your
yarn workspace there can only be one native source for all your react native project. This is most likely the usecase when you are working through a workspace. There isn't a
workaround for this, and you will have to opt to multiple
yarn workspaces if you need separate native codes.

Also checkout the `nativeRepo` configuration that allows you
to maintain your own native repo, just make sure that you
inherit your native repo from that provided by the foundation.

### Native source changes
The native source for `android` and `ios` makes a few subtle
changes to incorporate the configurations automatically.
1. **Android** `app/build.gradle` - Read app specific confgiration from a json file dynamically.
2. **Android** `app/src/main/res/strings.xml` - The display name is also provided and hence `app_name` has been removed.
3. **Android** `app/src/main/res/drawable/splash_background.xml`  `SplashTheme` has been added as a background for launch screen.
4. **Android** `app/src/main/res/values/styles.xml`. **SplashTheme** using the Splash Background has been defined.
5. **Android** `app/src/main/AndroidManifest.xml` `SplashActivity` has been added with an Intent to Launch. `MainActivity` uses `SplashTheme` as background. Just make sure your app renders with a background color to avoid showing the Splash Theme.
6. **Android** `..../SplashActivity.java` Activity file for showing the Launch screen.
7. **iOS** Uses CocoaPods to manage dependencies.
8. **iOS** `Foundation/AppDelegate.m` is modified to display
launch screen for an extended period, to avoid showing white screen when the javascript side loads. (Extracted from react-native pro-tip)
9. **iOS** Uses PlistBuddy to change `Foundation/Info.plist` dynamically to update `name`, `version`, `bundleId` and `build` when building ios app.

### Existing React Native Projects
The following changes need to be made to your native code
in the react-native project, for the foundation commands
to work.<br/>


**For iOS**<br/>
1. Include [foundation.config.js](#config-example) in the project root.
2. Add ios specific configuration in the config file.<br/>
   `ios: { scheme: '<RNProject>' }`. The scheme name is
   typically what you used to create the React Native
   project. This should be the main folder inside `ios`
   and should have the same scheme available for building.
3. `foundation run-ios` should now run the ios app on the
   simulator, `foundation release-ios` should generate
   ios app ready for publishing and `foundation upload-ios`
   should upload the app to the app store via iTunes connect.

**For Android**<br/>
1. Include [foundation.config.js](#config-example) in the project root.
2. Edit `android/app/build.gradle` to update app information
     1. Add the following line on top<br/>
     `def manifestJson = new groovy.json.JsonSlurper().parseText(file('../../build/manifest.json').text);`
     2. Use `manifestJson.bundleId` for `defaultConfig.applicationId`.
     3. Use `manifestJson.build` for `defaultConfig.versionCode`
     4. Use `manifestJson.version` for `defaultConfig.versionName`
     5. Include the following command somewhere inside `defaultConfig`<br/>
     `resValue "string", "app_name", manifestJson.appName`
3. Edit `android/app/src/main/res/values/strings.xml` and
   remove the line that defines app name `<string name="app_name">....</string>`
4. Remove any signing configuration that has been added
   to `android/app/build.gradle`. Provide the keystore file
   via the `foundation.config.js`. Otherwise `release-android`
   command might not work.
5. `foundation run-android` should now build the android app
   as per `foundation.config.js` and `foundation release-android` should generate apk ready for publishing.
6. The splash screen won't be available with these changes. It's however pretty easy, if you check how it works. Will document it later.

### Configurations
1. `appName`: The name of the app as displayed on your mobile
2. `bundleId`: A unique id that identifies your app on
  play store or app store.
3. `version`: A short text version name displayed on app
  store or play store.
4. `build`: A version number or build number used by
  play store and app store to track the version of your app.
5. `launcher`: A folder location that provides app launcher
  icons of all sizes. The folder should contain files for all
  phone resolutions which should be named as:
    * For android:
        * `ic_launcher-mdpi.png`
        * `ic_launcher-hdpi.png`
        * `ic_launcher-xhpi.ong`
        * `ic_launcher-xxhpi.ong`
        * `ic_launcher-xxxhpi.ong`
    * For ios:
        * `ios-20@1x.png`
        * `ios-20@2x.png`
        * `ios-20@3x.png`
        * `ios-29@1x.png`
        * `ios-29@2x.png`
        * `ios-29@3x.png`
        * `ios-40@1x.png`
        * `ios-40@2x.png`
        * `ios-40@3x.png`
        * `ios-60@2x.png`
        * `ios-76@1x.png`
        * `ios-76@2x.png`
        * `ios-83.5@2x.png`
        * `ios-1024@1x.png`
6. `splash`: A folder location that provides splash icons for
   all screen sizes.
    * For android:
        * `ic_splash-mdpi.png`
        * `ic_splash-hdpi.png`
        * `ic_splash-xhpi.png`
        * `ic_splash-xxhdpi.png`
        * `ic_splash-xxxhdpi.png`
    * For ios:
        * `ios-splash@1x.png`
        * `ios-splash@2x.png`
        * `ios-splash@3x.png`
7. `nativeRepo`: You can build your custom native repo and use
it instead of the stock foundation repo. Just make sure your
native repo supports foundation.
8. `android`: Android specific configuration. This can include
all the above configurations except `nativeRepo`
additionally provide:
    * `keyStore`: Path to android key store file required for
    signing your app for releasing to Google Play Store.
9. `ios`: iOS specific configuration. This can override all
the above configuratios except `nativeRepo` additionaly
provide:
    * `teamId`: The 10 character Apple team id available on your apple developer account.
    * `developerId`: The user id to login to your Apple developer account for publishing.

*You could also use the [Sketch App Template](https://github.com/sharingapples/react-native-foundation/blob/master/Icon-Template.sketch) for the `launcher` and `splash` icons.*

### Config Example
`foundation.config.js`
```javascript
module.exports = {
  appName: 'Name of the app',
  bundleId: 'com.sharingapples.foundation', // Identity of your app on play store or app store
  build: 10, // An incremental build number (android version code or ios Build
  version: '1.3.0', // A version text

  android: {
    keyStore: '~/secrets/my-apps-key.keystore'
  },
  ios: {
    teamId: '1234567890', // You 10 character team id
    developerId: 'someone@somewhere.com', // Your developer account id,
  },
};
```

## Releasing
You can easily release your app to Google Play Store and Apple App Store with simple commands.

**Android**:<br/>
> `$ foundation release-android`

With proper configuration, this command will generate an
apk ready to upload for Google Play Store. Make sure you
have properly [configured](#configurations) your `foundation.config.js` with
sigining keys.

**iOS**:<br/>
> `$ foundation release-ios`

This command will generate `ipa` files that are ready to
be deployed for app store. Make sure to include your
**teamId** in [configuration](#configurations).

> `$ foundation upload-ios`

This command will use your apple developer account and
submit the app for review on app store. Make sure to include
your **developerId** (email address) in [configuration](#configurations).

### Points to consider while releasing
2. If you are working with yarn workspaces. Make sure:
     * The native libraries dependencies are also there on
       your workspace `package.json`, even if they have been
       added to your apps' `package.json`.
     * There is an `index.js` on your workspace root, which
       simply imports your targetted apps index.js.
       `import './packages/your-app'`. This is needed since
       the ios and android javascript bundling works relative
       to where your `react-native` package is installed.
     * If there is a `.babelrc` in your workspace root, make
       sure it has `react-native` as a preset. Also include
       `babel-preset-react-native` as dev dependency.
3. Add release configurations in `foundation.config.js`.<br/>
   `android.keyStore`: Path to keystore required for app signing<br/>
   `ios.teamId`: The iOS team id for publishing your app<br/>
   `ios.developerId`: The apple developer id (email)
4. Environment variables for setting password<br/>
   `ANDROID_KEY_STORE_PASS`: password required for reading the key store file.<br/>
   `APPLER_DEVELOPER_PASS`: password to apple developer account to publish app via itunes connect.<br/>
   *If the passwords are not set, they would have to be provided during the release process*

## Additional commands
> `$ foundation info` <br/>
Display information as per your configuration.

> `$ foundation info-ios`<br/>
Display information considering ios platform.

> `$ foundation info-android`<br/>
Display information considering android platform.

## Notes
The react-native apps use `Foundation` as a default module name. So yes, in development mode you could use the same
native app to load different apps being served by the metro
bundler, and as long as there is no difference in react-native
version or native modules, your app should load just fine.

It's actually one of the way to improve app development. Build
one app with all your native dependencies. Deploy it on all
your test devices. And run `foundation start` anywhere.
