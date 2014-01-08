from setuptools import setup
setup(
     name="RaaS-internal",
     version="0.0.2",
     author="Sid Shanker",
     author_email="sid.p.shanker@gmail.com",
     description="Internal service for managing Rserve",
     packages=['raas_internal'],
     install_requires=['flask', 'fabric', 'pyRserve'],
     license='Creative Commons Attribution-Noncommercial-Share Alike license',
     long_description=open("README.md").read(),
)
