# Running the Tests

### Method 1: Direct execution

```bash
python app/server/tests/test_validators.py
```

### Method 2: Using unittest from the project root

```bash
python -m unittest discover -s app/server/tests
```

### Method 3: Run tests in app/server

```bash
python -m unittest tests.test_validators -v
python -m unittest tests.test_validators.TestValidateUsername -v
python -m unittest tests.test_validators.TestValidatePassword -v
python -m unittest tests.test_validators.TestValidateCredentials -v
```
