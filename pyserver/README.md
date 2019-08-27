# pyserver
Python based server that connects to a Apollo Graphql server using a websocket


### to run tests

* `python -m pytest tests/ --doctest-modules --junitxml=junit/test-results.xml -s  -o log_cli=true --log-cli-level=DEBUG`

* `python3 -m pytest tests/ --doctest-modules -s  -o log_cli=true --log-cli-level=DEBUG`
* `python3 -m pytest tests/ --doctest-modules -s  -o log_cli=true --log-cli-level=INFO`

### To run server
* `python3 task_runner.py`