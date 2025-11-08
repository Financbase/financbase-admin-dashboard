#!/bin/bash
# Setup script for Direct File development environment
# This script configures environment variables for Java 21, Maven, Scala, SBT, and Coursier

# Set Java 21
export JAVA_HOME=$(brew --prefix openjdk@21)
export PATH="$JAVA_HOME/bin:$PATH"

# Configure Coursier to use Java 21
eval "$(coursier java --jvm 21 --env)"

# Verify installations
echo "Java version:"
java -version

echo -e "\nMaven version:"
mvn --version | head -3

echo -e "\nScala version:"
scala -version

echo -e "\nSBT version:"
sbt --version

echo -e "\nCoursier version:"
coursier --version

echo -e "\n✅ All tools verified!"

