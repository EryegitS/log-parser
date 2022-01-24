# Log Parser Tool

### Flow

The application should find all the log messages with the level error and print them into the output file. Formats of input and outfit files are described below.

* reads the log file that is flagged as input,
* Processes only the logs that is error level
* Parse and write the results to the json file that is flagged as output.
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

|       Flag        | Default | Description                   |
|-------------------|---------|-------------------------------|
| `--input`         |./app.log| log file that will be parsed     |
| `--output`        |./errors.json| json file that is created after process  |

### Setup
install all dependencies via npm
```shell
npm install
```

after installation ready to run program.
```shell
rimraf dist && tsc && node dist/parser.js --input ./test.log --output ./errors.json
```
