'use client';

import {
  ShoppingBag,
  Shield,
  Truck,
  Heart,
  Users,
  Award,
  CheckCircle,
  Star,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
              About Kload
            </h1>
            <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto">
              Your trusted destination for premium electronics and exceptional
              shopping experiences
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            At Kload, we're passionate about bringing you the latest and
            greatest in technology. Our mission is to provide exceptional
            products, outstanding customer service, and a seamless shopping
            experience that makes technology accessible to everyone.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Quality</h3>
            <p className="text-gray-600">
              We only offer products that meet our high standards of quality and
              reliability.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Fast Delivery
            </h3>
            <p className="text-gray-600">
              Quick and reliable shipping to get your products to you as soon as
              possible.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Customer First
            </h3>
            <p className="text-gray-600">
              Your satisfaction is our top priority. We're here to help every
              step of the way.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Excellence
            </h3>
            <p className="text-gray-600">
              We strive for excellence in everything we do, from product
              selection to service.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-black mb-6">Our Story</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded in 2024, Kload began with a simple vision: to make
                premium electronics accessible to everyone. What started as a
                small online store has grown into a trusted destination for tech
                enthusiasts and casual shoppers alike.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We believe that technology should enhance your life, not
                complicate it. That's why we carefully curate our product
                selection and provide expert guidance to help you find exactly
                what you need.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to serve customers across the country,
                offering everything from wireless headphones to the latest
                gadgets, all backed by our commitment to quality and customer
                satisfaction.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Why Choose Kload?</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Curated selection of premium products</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Expert customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Fast and reliable shipping</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Products</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.8</div>
            <div className="text-gray-600 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              Average Rating
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-black mb-6">Meet Our Team</h3>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Our dedicated team of tech enthusiasts and customer service experts
            are here to help you find the perfect products for your needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">
                Customer Support
              </h4>
              <p className="text-gray-600">
                Our friendly support team is available 24/7 to help with any
                questions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">
                Product Experts
              </h4>
              <p className="text-gray-600">
                Tech-savvy professionals who know every product inside and out.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-16 w-16 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">
                Quality Assurance
              </h4>
              <p className="text-gray-600">
                Ensuring every product meets our high standards before reaching
                you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Experience Kload?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Discover our amazing collection of premium electronics today.
          </p>
          <a
            href="/shop"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
