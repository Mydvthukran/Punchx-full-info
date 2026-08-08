import { Worker } from '../types';

export const ALL_EXPERTS: Worker[] = [
  {
    id: 'rajesh',
    name: 'Rajesh Kumar',
    category: 'AC Repair',
    rating: 4.9,
    reviewsCount: 182,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGSkUfdfY3HcncTIY6PcfYdkpVlEw562C-in1-G55qC0H9bSKFW8cqmF3xtLQBiLByv5gRtdxWkYekhxeENWyFwDm8ul37KWcjYkERdCJIh3koj0rjMu5e_gD3YlqWbGhl-QHhYi6ut8VbLAlzAtiB0EsJQi8z-zzFZcQ7woGa9eEX8eNwTef7-3MnRen3OP5KenmJgDdlswqLaCtAAmMZ5DF5bLC6SCpZg_YiJm3UtNjd--OeKUw_xIodwne7y1Lg0eex3BtxJQ',
    proBadge: 'PRO',
    price: 180,
    available: true
  },
  {
    id: 'amit',
    name: 'Amit Sharma',
    category: 'AC Repair',
    rating: 4.8,
    reviewsCount: 95,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNQG_Ib7sdiH6QXYqBw6S_FG0Y67Y7FgIXUPIeaY2UwugJ-dsjGIOuz75pqZ-gmDI4nO6bU7pf-MCFxgjHfSXbnc5pdyy9dYr_j2loJtuv5iowie-V1v3XdqJBksNQGIRl4df5rkYh9GQtdBVuclqjfOZ-F4XvkL7Uk0YPh3VFfiAVKx1Pe91GJISO7Eaag0wncdLNhCWtreBTVBTblTZTeKb92BfW9pJ-_gtgDPnzRD3o9Uy1Yn4uF9dO9YgCZf7CQLSNc0qSkPw',
    proBadge: 'VET',
    price: 210,
    available: false
  },
  {
    id: 'marcus',
    name: 'Marcus Thorne',
    category: 'Electrical',
    rating: 4.9,
    reviewsCount: 128,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzF-ZNX1ONoqZl4NpujkifTMt7bovwv5F_dHcy6LKgigipMusAINZ49fwFybVr8bv5ajkmEebzd7JjWTKdbrLoUtswcs-_hAJFyB5E1jUH32721A6RxM_xmDQ9WYGP4vl5r8qEvV66JF0l_ExQnbN9_4AD2qy8YyV3lOqt4LiPdNOUpvwmhtCQgwbDf18scKXjX_-yDedvydF7z3-IkIHxiD4QOGKwJ5Uje1wEcAYAkS3OXQBxY5PUt3cHt3ewunp_nyeLRUeS974',
    proBadge: 'PRO',
    price: 199,
    available: true
  },
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    category: 'Electrical',
    rating: 4.75,
    reviewsCount: 64,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBnQN095fkHnimX3ZMLBOnXJJOxndVI3YgA-s7n6Px1ACC_lCXM_93dMVgnMbT4x5i9XbPD_QXkkuzGcaPrKSaaHxUxI6xfPs6L_3n_KQP-q7A89kBnLSr08YKmhq8NJC9DJ4dsMdwcbKOXzCMHWa7luCe3xAAgPMeEOsR__JcrN0-XN4N0z2T21OPHgDyYhOQDfSFPW9DRnR2vSm20hNyVzZGuVzQoaGQmnC_OYq2XYizdFkWcTvFmPQLwTvvF3WDWKC_QPzX6V0',
    proBadge: 'TOP',
    price: 160,
    available: true
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    category: 'Plumbing',
    rating: 4.85,
    reviewsCount: 142,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAl2mlPeDILv0yu23h0u0gdaAnA7Sx2IcCja5YlCHj0SI468csLOLd3qWJDY8X2lcEIAnwR2d5bQ23J7eQUvQHDNYjVDFNi3FipehpDpZUiUAOJgTgPy-1wT99JU7GIqy4eUs0b0fB28X3DL6TlIGhoXqV-tLhRyU2ibRfIvwuoLmF6aYBp-HD30Mre9n_ZmOrCG0jzVjUBEsDTiXiwUh9hsEsoq8DVIpGUlZjmI6ZXRiZM_JEfIbTiLQrZBsPv2-O1kSJIx1dq_g',
    proBadge: 'TOP',
    price: 150,
    available: true
  },
  {
    id: 'rohan',
    name: 'Rohan Das',
    category: 'Plumbing',
    rating: 4.6,
    reviewsCount: 78,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlRCkOTPvGdF_cQiOTGX6eI5gL1Fnk5vZwLM1nW9xIRpj9eAn05WVz48PLxgMr4NU5lqV_i1o-HtH76xMYpeqYTlz4M4amVujpLLjnkmyAzbuu1fbzhoSdfgK3BiGZoXcQuFCAgrGUFwdQU7KYU4XhJDOfVPOBwSqTWmG9i9UV7skA3elaBvljem2K4Sqzm5BOZxDb1emhmy_b8XgHdBIogy-lktt_4I_IkBCYtOvTtBJUKkbuetJjtIA7OqZdsXtVbXGe66lmG-M',
    proBadge: 'VET',
    price: 130,
    available: false
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    category: 'Cleaning',
    rating: 4.95,
    reviewsCount: 250,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAl2mlPeDILv0yu23h0u0gdaAnA7Sx2IcCja5YlCHj0SI468csLOLd3qWJDY8X2lcEIAnwR2d5bQ23J7eQUvQHDNYjVDFNi3FipehpDpZUiUAOJgTgPy-1wT99JU7GIqy4eUs0b0fB28X3DL6TlIGhoXqV-tLhRyU2ibRfIvwuoLmF6aYBp-HD30Mre9n_ZmOrCG0jzVjUBEsDTiXiwUh9hsEsoq8DVIpGUlZjmI6ZXRiZM_JEfIbTiLQrZBsPv2-O1kSJIx1dq_g',
    proBadge: 'TOP',
    price: 249,
    available: true
  },
  {
    id: 'deepak',
    name: 'Deepak Verma',
    category: 'Cleaning',
    rating: 4.7,
    reviewsCount: 110,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzF-ZNX1ONoqZl4NpujkifTMt7bovwv5F_dHcy6LKgigipMusAINZ49fwFybVr8bv5ajkmEebzd7JjWTKdbrLoUtswcs-_hAJFyB5E1jUH32721A6RxM_xmDQ9WYGP4vl5r8qEvV66JF0l_ExQnbN9_4AD2qy8YyV3lOqt4LiPdNOUpvwmhtCQgwbDf18scKXjX_-yDedvydF7z3-IkIHxiD4QOGKwJ5Uje1wEcAYAkS3OXQBxY5PUt3cHt3ewunp_nyeLRUeS974',
    proBadge: 'PRO',
    price: 160,
    available: true
  },
  {
    id: 'vikram',
    name: 'Vikram Rathore',
    category: 'Painting',
    rating: 4.65,
    reviewsCount: 52,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBnQN095fkHnimX3ZMLBOnXJJOxndVI3YgA-s7n6Px1ACC_lCXM_93dMVgnMbT4x5i9XbPD_QXkkuzGcaPrKSaaHxUxI6xfPs6L_3n_KQP-q7A89kBnLSr08YKmhq8NJC9DJ4dsMdwcbKOXzCMHWa7luCe3xAAgPMeEOsR__JcrN0-XN4N0z2T21OPHgDyYhOQDfSFPW9DRnR2vSm20hNyVzZGuVzQoaGQmnC_OYq2XYizdFkWcTvFmPQLwTvvF3WDWKC_QPzX6V0',
    proBadge: 'VET',
    price: 175,
    available: true
  },
  {
    id: 'david',
    name: 'David Chen',
    category: 'Carpentry',
    rating: 4.8,
    reviewsCount: 89,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBnQN095fkHnimX3ZMLBOnXJJOxndVI3YgA-s7n6Px1ACC_lCXM_93dMVgnMbT4x5i9XbPD_QXkkuzGcaPrKSaaHxUxI6xfPs6L_3n_KQP-q7A89kBnLSr08YKmhq8NJC9DJ4dsMdwcbKOXzCMHWa7luCe3xAAgPMeEOsR__JcrN0-XN4N0z2T21OPHgDyYhOQDfSFPW9DRnR2vSm20hNyVzZGuVzQoaGQmnC_OYq2XYizdFkWcTvFmPQLwTvvF3WDWKC_QPzX6V0',
    proBadge: 'VET',
    price: 149,
    available: false
  },
  {
    id: 'sunita',
    name: 'Sunita Rao',
    category: 'Pest Control',
    rating: 4.85,
    reviewsCount: 116,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAl2mlPeDILv0yu23h0u0gdaAnA7Sx2IcCja5YlCHj0SI468csLOLd3qWJDY8X2lcEIAnwR2d5bQ23J7eQUvQHDNYjVDFNi3FipehpDpZUiUAOJgTgPy-1wT99JU7GIqy4eUs0b0fB28X3DL6TlIGhoXqV-tLhRyU2ibRfIvwuoLmF6aYBp-HD30Mre9n_ZmOrCG0jzVjUBEsDTiXiwUh9hsEsoq8DVIpGUlZjmI6ZXRiZM_JEfIbTiLQrZBsPv2-O1kSJIx1dq_g',
    proBadge: 'PRO',
    price: 120,
    available: true
  },
  {
    id: 'malhotra',
    name: 'Vijay Malhotra',
    category: 'Moving',
    rating: 4.9,
    reviewsCount: 202,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlRCkOTPvGdF_cQiOTGX6eI5gL1Fnk5vZwLM1nW9xIRpj9eAn05WVz48PLxgMr4NU5lqV_i1o-HtH76xMYpeqYTlz4M4amVujpLLjnkmyAzbuu1fbzhoSdfgK3BiGZoXcQuFCAgrGUFwdQU7KYU4XhJDOfVPOBwSqTWmG9i9UV7skA3elaBvljem2K4Sqzm5BOZxDb1emhmy_b8XgHdBIogy-lktt_4I_IkBCYtOvTtBJUKkbuetJjtIA7OqZdsXtVbXGe66lmG-M',
    proBadge: 'PRO',
    price: 299,
    available: true
  }
];
