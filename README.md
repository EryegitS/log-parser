# Log Parser Tool

### Flow

The application should find all the log messages with the level error and print them into the output file. Formats of input and outfit files are described below.
* get log file location by parsing input flag (process argv)
* get output file location by parsing input flag (process argv)
* reads the log file line by line as **ReadStream**,
* Parse and convert to Log object.
* Publish selected log level(s) with observers. (Log level is dynamically changeable by updating filter.)
* **Json Exporter** which is one of observer of **Log Reader** will export logs in JSON format.
---
### Input Format

```
<ISO Date> - <Log Level> - {"transactionId: "<UUID>", "details": "<message event/action description>", "err": "<Optionall, error description>", ...<additional log information>}
```
---

### Output Format

```
[{"timestamp": <Epoch Unix Timestamp>, "loglevel": "<loglevel>", "transactionId: "<UUID>", "err": "<Error message>" }]
```
---

### Configuration
Before start program you have to add flags to script that is for running the application

|       Flag        | Example | Description                   |
|-------------------|---------|-------------------------------|
| `--input`         |./app.log| log file that will be parsed     |
| `--output`        |./errors.json| json file that is created after process  |

### Setup
install all dependencies via npm
```shell
npm install
```

###### Build Script
build the app
```shell
npm run build
```

###### Run Script
after installation ready to run program.
```shell
node dist/src/parser.js --input ./app.log --output ./errors.json
```
