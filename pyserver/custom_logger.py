# pyserver/__init__.py

import logging
import io, sys
from typing import Set

class CustomLogger():
    
    loggers: Set[str] = set()

    def __init__(self, name):

        # Initial construct.
        self.format = "[%(filename)s:%(lineno)s-%(funcName)20s()] %(message)s"
        self.level = logging.DEBUG
        self.name = name

        # Logger configuration.
        self.console_formatter = logging.Formatter(self.format)
        self.console_logger = logging.StreamHandler(sys.stdout)
        self.console_logger.setFormatter(self.console_formatter)

        self.sio = io.StringIO()
        self.stream_logger = logging.StreamHandler(self.sio)
        self.stream_logger.setFormatter(self.console_formatter)

        # Complete logging config.
        self.logger = logging.getLogger(name)
        if name not in self.loggers:
            self.loggers.add(name)
            self.logger.setLevel(self.level)
            self.logger.addHandler(self.console_logger)
            self.logger.addHandler(self.stream_logger)

