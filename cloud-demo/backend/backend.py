import json
import boto3
import os
import decimal

table_name = os.environ.get("TABLE_NAME", "makeAutomaticProducts")
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(table_name)


def lambda_handler(event, context):
    # Validar que sea GET /products
    if event.get("requestContext", {}).get("http", {}).get("method") != "GET" or \
       event.get("rawPath") != "/products":
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Bad Request"})
        }

    try:
        response = table.scan()
        items = response.get("Items", [])

        # convertir Decimals a float
        def convert_decimals(obj):
            if isinstance(obj, list):
                return [convert_decimals(i) for i in obj]
            elif isinstance(obj, dict):
                return {k: convert_decimals(v) for k, v in obj.items()}
            elif isinstance(obj, decimal.Decimal):
                return float(obj)
            else:
                return obj

        clean_items = convert_decimals(items)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps(clean_items)
        }

    except Exception as e:
        print("Error scanning DynamoDB:", e)
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Internal Server Error",
                "error": str(e)
            })
        }
