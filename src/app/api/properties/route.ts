/**
 * Properties API Routes
 * GET: List properties with pagination and filtering
 * POST: Create property (admin/asesor only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import {
  getActiveProperties,
  createProperty,
} from '@/lib/database/queries';
import { ApiResponse, PaginatedResponse, Property } from '@/lib/types';
import { verifyToken } from '@/lib/auth/jwt';

// ========== GET: List Properties ==========
/**
 * GET /api/properties
 * List all active properties with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '20')));
    const type = searchParams.get('type') || undefined;
    const location = searchParams.get('location') || undefined;
    const minPrice = searchParams.get('minPrice')
      ? parseInt(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseInt(searchParams.get('maxPrice')!)
      : undefined;

    // Query properties
    const { data, error } = await getActiveProperties(supabase, page, limit, {
      type,
      location,
      minPrice,
      maxPrice,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUERY_ERROR',
            message: 'Failed to fetch properties',
            details: error,
          },
        } as ApiResponse<PaginatedResponse<Property>>,
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'activa')
      .not('published_at', 'is', null);

    if (type) countQuery = countQuery.eq('type', type);
    if (location) countQuery = countQuery.ilike('location', `%${location}%`);
    if (minPrice) countQuery = countQuery.gte('price', minPrice);
    if (maxPrice) countQuery = countQuery.lte('price', maxPrice);

    const { count } = await countQuery;
    const total = count || 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          items: data || [],
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
        meta: {
          timestamp: Date.now(),
          version: '1.0.0',
        },
      } as ApiResponse<PaginatedResponse<Property>>
    );
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// ========== POST: Create Property ==========
/**
 * POST /api/properties
 * Create new property (admin/asesor only)
 */
export async function POST(request: NextRequest) {
  try {
    // Get and verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing Authorization header',
          },
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET not configured');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Server not properly configured',
          },
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    let payload;
    try {
      payload = verifyToken(token, secret);
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Check authorization (admin or asesor only)
    if (payload.role !== 'admin' && payload.role !== 'asesor') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins and asesores can create properties',
          },
        } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['id', 'title', 'type', 'price', 'location'];
    const missing = requiredFields.filter((field) => !(field in body));

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: { missing },
          },
        } as ApiResponse<null>,
        { status: 422 }
      );
    }

    // Validate type and status
    const validTypes = ['casa', 'departamento', 'terreno', 'comercial', 'inversion'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property type',
            details: { validTypes },
          },
        } as ApiResponse<null>,
        { status: 422 }
      );
    }

    // Create property with current user as creator
    const propertyData: Omit<Property, 'createdAt' | 'updatedAt'> = {
      ...body,
      status: body.status || 'activa',
      featured: body.featured || false,
      images: body.images || [],
      amenities: body.amenities || [],
    };

    const { data, error } = await createProperty(supabase, propertyData);

    if (error) {
      console.error('Create property error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create property',
            details: error,
          },
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: Date.now(),
          version: '1.0.0',
        },
      } as ApiResponse<Property>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Properties POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// ========== OPTIONS: CORS ==========
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
