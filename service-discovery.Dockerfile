FROM eclipse-temurin:17-jdk
ARG JAR_FILE=service-discovery/build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT [ \
    "java", \
    "-jar", \
    "/app.jar", \
    "-web -webAllowOthers -tcp -tcpAllowOthers -browser -ifNotExists" \
]