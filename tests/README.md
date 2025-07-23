# Running the Tests

### Method 1: Direct execution

```bash
python tests/test_validators.py
```

### Method 2: Using unittest module

```bash
python -m unittest tests.test_validators -v
```

### Method 3: Run specific test classes

```bash
python -m unittest tests.test_validators.TestValidateUsername -v
python -m unittest tests.test_validators.TestValidatePassword -v
python -m unittest tests.test_validators.TestValidateCredentials -v
```
