function wait {
    container=$1
    message=$2

    function ready {
        docker logs $container | grep "$message" > /dev/null 2>&1
    }

    echo "Waiting for $container to start"
    while ! ready;
    do sleep 0.1;
    done
}

function test-generated-apis {
    echo "Testing generated apis"

    docker rm -f alpha-api-generated > /dev/null 2>&1
    docker run --detach --name alpha-api-generated -p 3030:3000 --net=restnet emilrais/alpha-api-generated > /dev/null 2>&1
    wait alpha-api-generated "Listening"

    docker rm -f beta-api-generated > /dev/null 2>&1
    docker run --detach --name beta-api-generated -p 3031:3000 --net=restnet emilrais/beta-api-generated > /dev/null 2>&1
    wait beta-api-generated "Listening"

    node_modules/mocha/bin/mocha build

    docker rm -f alpha-api-generated > /dev/null 2>&1
    docker rm -f beta-api-generated > /dev/null 2>&1
}

function test-manual-apis {
    echo "Testing manual apis"
    
    docker rm -f alpha-api-manual > /dev/null 2>&1
    docker run --detach --name alpha-api-manual -p 3030:8080 --net=restnet emilrais/alpha-api-manual > /dev/null 2>&1
    wait alpha-api-manual "Deployed"

    docker rm -f beta-api-manual > /dev/null 2>&1
    docker run --detach --name beta-api-manual -p 3031:8080 --net=restnet emilrais/beta-api-manual > /dev/null 2>&1
    wait beta-api-manual "Deployed"

    node_modules/mocha/bin/mocha build

    docker rm -f alpha-api-manual > /dev/null 2>&1
    docker rm -f beta-api-manual > /dev/null 2>&1
}

test-generated-apis
test-manual-apis
