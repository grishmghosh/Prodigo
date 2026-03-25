import uuid

import psycopg2
from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor

from app.db import get_db_connection


supplier_bp = Blueprint("supplier_bp", __name__)


@supplier_bp.route("/suppliers", methods=["POST"])
def create_supplier():
	payload = request.get_json(silent=True) or {}
	name = payload.get("name")
	phone = payload.get("phone")
	address = payload.get("address")

	if not name or not phone or not address:
		return jsonify({"error": "name, phone, and address are required"}), 400

	supplier_id = str(uuid.uuid4())
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			INSERT INTO suppliers (id, name, phone, address, is_active)
			VALUES (%s, %s, %s, %s, %s)
			RETURNING id, name, phone, address, is_active
			""",
			(supplier_id, name, phone, address, True),
		)
		new_supplier = cursor.fetchone()
		connection.commit()
		return jsonify(new_supplier), 201
	except (psycopg2.Error, ValueError) as error:
		if connection:
			connection.rollback()
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@supplier_bp.route("/suppliers", methods=["GET"])
def get_suppliers():
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			SELECT id, name, phone, address, is_active
			FROM suppliers
			ORDER BY name ASC
			"""
		)
		suppliers = cursor.fetchall()
		return jsonify(suppliers), 200
	except (psycopg2.Error, ValueError) as error:
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@supplier_bp.route("/suppliers/<supplier_id>", methods=["GET"])
def get_supplier(supplier_id):
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			SELECT id, name, phone, address, is_active
			FROM suppliers
			WHERE id = %s
			""",
			(supplier_id,),
		)
		supplier = cursor.fetchone()

		if not supplier:
			return jsonify({"error": "Supplier not found"}), 404

		return jsonify(supplier), 200
	except (psycopg2.Error, ValueError) as error:
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@supplier_bp.route("/suppliers/<supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
	payload = request.get_json(silent=True) or {}
	name = payload.get("name")
	phone = payload.get("phone")
	address = payload.get("address")

	if not name or not phone or not address:
		return jsonify({"error": "name, phone, and address are required"}), 400

	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			UPDATE suppliers
			SET name = %s, phone = %s, address = %s
			WHERE id = %s
			RETURNING id, name, phone, address, is_active
			""",
			(name, phone, address, supplier_id),
		)
		updated_supplier = cursor.fetchone()

		if not updated_supplier:
			connection.rollback()
			return jsonify({"error": "Supplier not found"}), 404

		connection.commit()
		return jsonify(updated_supplier), 200
	except (psycopg2.Error, ValueError) as error:
		if connection:
			connection.rollback()
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@supplier_bp.route("/suppliers/<supplier_id>", methods=["DELETE"])
def delete_supplier(supplier_id):
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			UPDATE suppliers
			SET is_active = %s
			WHERE id = %s
			RETURNING id, name, phone, address, is_active
			""",
			(False, supplier_id),
		)
		deleted_supplier = cursor.fetchone()

		if not deleted_supplier:
			connection.rollback()
			return jsonify({"error": "Supplier not found"}), 404

		connection.commit()
		return jsonify(deleted_supplier), 200
	except (psycopg2.Error, ValueError) as error:
		if connection:
			connection.rollback()
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()
