'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, User, Building2, Mail, Calendar, MapPin, Globe, Twitter, Linkedin, Github } from 'lucide-react'
import { useSupabase } from '@/context/supabase-context'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Database, ProfileMetadata } from '@/types/database'
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from '@/components/ui/separator'

const socialLinksSchema = z.object({
  twitter: z.string().url('Please enter a valid URL').or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL').or(z.literal('')),
  github: z.string().url('Please enter a valid URL').or(z.literal('')),
})

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  company: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  social_links: socialLinksSchema,
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { supabase, user } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      avatar_url: '',
      bio: '',
      company: '',
      role: '',
      location: '',
      website: '',
      social_links: {
        twitter: '',
        linkedin: '',
        github: '',
      },
    },
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          setProfile(data)
          form.reset({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || '',
            bio: data.metadata.bio || '',
            company: data.metadata.company || '',
            role: data.metadata.role || '',
            location: data.metadata.location || '',
            website: data.metadata.website || '',
            social_links: data.metadata.social_links,
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSaving(true)
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          metadata: {
            bio: data.bio || '',
            company: data.company || '',
            role: data.role || '',
            location: data.location || '',
            website: data.website || '',
            social_links: data.social_links,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex flex-col gap-8 p-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and profile settings
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{profile?.full_name || 'Your Name'}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {profile?.metadata.role && (
                    <>
                      <span>{profile.metadata.role}</span>
                      <span>•</span>
                    </>
                  )}
                  {profile?.metadata.company && (
                    <>
                      <span>{profile.metadata.company}</span>
                      <span>•</span>
                    </>
                  )}
                  {profile?.metadata.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.metadata.location}
                    </span>
                  )}
                </CardDescription>
                {profile?.metadata.website && (
                  <a
                    href={profile.metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {new URL(profile.metadata.website).hostname}
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  {profile?.metadata.social_links.twitter && (
                    <a
                      href={profile.metadata.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {profile?.metadata.social_links.linkedin && (
                    <a
                      href={profile.metadata.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {profile?.metadata.social_links.github && (
                    <a
                      href={profile.metadata.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {profile?.metadata.bio && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    {profile.metadata.bio}
                  </div>
                </>
              )}

              <Separator />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Your role or title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Your location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-website.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <FormLabel>Social Links</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="social_links.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="absolute pl-2.5">
                                  <Twitter className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <Input className="pl-9" placeholder="Twitter URL" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="social_links.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="absolute pl-2.5">
                                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <Input className="pl-9" placeholder="LinkedIn URL" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="social_links.github"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="absolute pl-2.5">
                                  <Github className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <Input className="pl-9" placeholder="GitHub URL" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the URL of your profile picture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 