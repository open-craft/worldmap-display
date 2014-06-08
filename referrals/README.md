
# Referrals statistics

## Setup

Upload a 1px transparent image on S3 alongside the map static assets and make it public. Turn S3 logging on with the default format.

**Important**: Don't use the website url, but the REST one you can get in the control panel, `x-` query strings are not supported in WEBSITE logs. For the README we will use this location:

```
https://s3.amazonaws.com/harvard-atlas-demo/stat.png
```

Embed the 1px image on the Qualtrics survey: edit the body of a question in HTML mode and append this (choose a NAME unique to the survey):

```
<img src="https://s3.amazonaws.com/harvard-atlas-demo/stat.png?x-atlas-analytics=NAME-qualtrics-survey" />
```

Embed the same image on edX next to the survey `iframe`:

```
<img src="https://s3.amazonaws.com/harvard-atlas-demo/stat.png?x-atlas-analytics=NAME-edx-survey" />
```

and next to the map `iframe` (note the different query string)

```
<img src="https://s3.amazonaws.com/harvard-atlas-demo/stat.png?x-atlas-analytics=NAME-edx-map" />
```

## Generating the stats

Download the S3 logs in a folder on your local system, fill out the config.yml and run

```
./referrals.py config.yml
```
