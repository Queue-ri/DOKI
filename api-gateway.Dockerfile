FROM eclipse-temurin:17-jdk
ARG JAR_FILE=api-gateway/build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT [ \
    "java", \
    "-jar", \
    "/app.jar", \
    "-web -webAllowOthers -tcp -tcpAllowOthers -browser -ifNotExists" \
]